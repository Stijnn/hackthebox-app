use std::{
    collections::HashMap,
    sync::{Arc, Mutex, OnceLock},
};

use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::pipelines::{logging::add_log, nmap::run_nmap};

mod logging;
mod nmap;

type NativeFn = Arc<dyn Fn(NativeFnContext) -> Result<(), ()> + Send + Sync>;

pub fn wrap_native_fn<T, F>(f: F) -> NativeFn
where
    T: serde::de::DeserializeOwned + Send + Sync + 'static,
    F: Fn(T) -> Result<(), ()> + Send + Sync + 'static,
{
    Arc::new(
        move |ctx: NativeFnContext| match serde_json::from_value::<T>(ctx.context) {
            Ok(typed_args) => f(typed_args),
            Err(e) => {
                eprintln!("Deserialization error for {}: {}", ctx.name, e);
                Err(())
            }
        },
    )
}

macro_rules! register_native {
    ($($name:expr => $func:ident),* $(,)?) => {
        {
            let mut map: HashMap<String, NativeFn> = HashMap::new();
            $(
                map.insert($name.to_string(), wrap_native_fn($func));
            )*
            map
        }
    };
}

fn impl_get_context() -> HashMap<String, NativeFn> {
    register_native![
        "nmap" => run_nmap,
        "log" => add_log,
        "println!" => add_log,
    ]
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub(crate) struct NativeFnContext {
    name: String,
    context: Value,
}

static FUNCTION_LIBRARY: OnceLock<Mutex<HashMap<String, NativeFn>>> = OnceLock::new();

fn impl_get_native_fn_map() -> &'static std::sync::Mutex<
    HashMap<std::string::String, Arc<dyn Fn(NativeFnContext) -> Result<(), ()> + Send + Sync>>,
> {
    FUNCTION_LIBRARY.get_or_init(|| {
        let mut map: HashMap<String, NativeFn> = HashMap::new();
        impl_get_context().iter().for_each(|kv| {
            map.insert(kv.0.clone(), kv.1.clone());
        });
        Mutex::new(map)
    })
}

async fn impl_find_fn_in_registry(key: String) -> Result<NativeFn, String> {
    let registry = impl_get_native_fn_map()
        .lock()
        .map_err(|_| "Failed to lock registry")?;

    return match registry.get(&key) {
        Some(f) => Ok(f.clone()),
        None => Err(format!("Fn({key}) was not found")),
    };
}

async fn impl_invoke_from_registry(payload: NativeFnContext) -> Result<(), String> {
    let event_name = payload.name.clone();
    match impl_find_fn_in_registry(event_name).await {
        Ok(f) => {
            let r = (f)(payload);
            Ok(())
        }
        Err(e) => Err(e),
    }
}

/**
 * Get available native functions callable with ReactFlow Native Compute Node
 */
#[tauri::command]
pub(crate) async fn get_available_native_functions() -> Result<Vec<String>, String> {
    let registry = impl_get_native_fn_map()
        .lock()
        .map_err(|_| "Failed to lock registry")?;

    Ok(registry
        .iter()
        .map(|(name, _)| name.clone())
        .collect::<Vec<String>>())
}

/**
 * Invoke function from Native Compute Node
 */
#[tauri::command]
pub(crate) async fn invoke_native_fn(
    app: tauri::AppHandle,
    window: tauri::Window,
    invoke_ctx: NativeFnContext,
) -> Result<(), String> {
    impl_invoke_from_registry(invoke_ctx).await
}

#[cfg(test)]
mod pipeline_tests {
    use tauri::async_runtime::block_on;

    use crate::pipelines::{get_available_native_functions, impl_get_native_fn_map};

    #[test]
    fn get_native_fn_map_should_have_println() {
        let registry = impl_get_native_fn_map()
            .lock()
            .map_err(|_| "Could not lock registry");

        assert!(registry.is_ok(), "Registry retrieval is NOT ok!");
        if registry.is_err() {
            return;
        }

        let registry = registry.unwrap();
        let a = registry.get(&"println!".to_owned());
        assert!(
            a.is_some(),
            "Could not find println! function in native registry"
        );
    }

    #[test]
    fn get_available_native_functions_should_have_println() {
        block_on(async move {
            let available = get_available_native_functions().await;

            assert!(available.is_ok(), "Failed to retrieve function map");
            if available.is_err() {
                return;
            }

            assert!(
                available.unwrap().iter().any(|f| f.eq("println!")),
                "Could not find println! function that should exist!"
            );
        });
    }
}
