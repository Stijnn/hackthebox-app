use std::process::{Child, Command};

use serde::{Deserialize, Serialize};
use tauri::{
    async_runtime::{channel, spawn, Receiver, Sender},
    Emitter,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct Pipeline {
    name: String,
    commands: Vec<PipelineCommand>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct PipelineCommand {
    name: String,
    program: String,
    arguments: Vec<String>,
    after: Vec<PipelineCommand>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct PipelineEvent {
    command_name: String,
    event_type: String,
    event_message: String,
}

impl PipelineEvent {
    fn new(command_name: String, event_type: String, event_message: String) -> Self {
        Self {
            command_name,
            event_type,
            event_message,
        }
    }
}

/**
 * Spawn pipeline in a async runtime, relay PipelineEvent in real-time using emit invoke.
 */
#[tauri::command]
pub(crate) async fn run_pipeline(
    app: tauri::AppHandle,
    _window: tauri::Window,
    pipeline: Option<Pipeline>,
) -> Result<(), String> {
    if !cfg!(any(
        target_os = "windows",
        target_os = "linux",
        target_os = "macos"
    )) {
        return Err("Not supported".to_owned());
    }

    let pipeline_spawn_result = spawn_pipeline(pipeline).await;
    return match pipeline_spawn_result {
        Ok(mut event_loop) => {
            while let Some(event) = event_loop.recv().await {
                let _emit_result = app.emit("pipeline-event", event);
            }
            Ok(())
        }
        Err(e) => Err(e),
    };
}

/**
 * Check if program was built for Windows, Linux or MacOS. If so it can run pipelines.
 */
#[tauri::command]
pub(crate) async fn check_can_run_pipelines() -> bool {
    cfg!(any(
        target_os = "windows",
        target_os = "linux",
        target_os = "macos"
    ))
}

const PIPELINE_EVENT_BUFFER_SIZE: usize = 32;
async fn spawn_pipeline(pipeline: Option<Pipeline>) -> Result<Receiver<PipelineEvent>, String> {
    if pipeline.is_none() {
        return Err("No pipeline was given...".into());
    }

    let (tx, rx) = channel::<PipelineEvent>(PIPELINE_EVENT_BUFFER_SIZE);
    spawn(async move {
        pipeline.unwrap().run(&tx).await;
    });

    Ok(rx)
}

impl Pipeline {
    async fn run(&self, tx: &Sender<PipelineEvent>) {
        let _ = tx
            .send(PipelineEvent::new(
                "pipeline-started".into(),
                "info".into(),
                "Pipeline started".into(),
            ))
            .await;

        for cmd in self.commands.clone().into_iter() {
            cmd.run(tx.clone()).await;
        }

        let _ = tx
            .send(PipelineEvent::new(
                "pipeline-shutdown".into(),
                "info".into(),
                "Pipeline shutdown".into(),
            ))
            .await;
    }
}

impl PipelineCommand {
    async fn run(&self, tx: Sender<PipelineEvent>) {
        let spawn_result = Command::new(self.program.as_str())
            .args(self.arguments.iter())
            .spawn();
        match spawn_result {
            Ok(out) => {
                forward_child_stdout(out, &tx).await;
            }
            Err(e) => {}
        }
    }
}

async fn forward_child_stdout(mut child: Child, tx: &Sender<PipelineEvent>) {
    let exit_status = child.wait();
    match exit_status {
        Ok(status) => {
            let _ = tx
                .send(PipelineEvent::new(
                    "pipeline-exit-status-request".into(),
                    "exit".into(),
                    format!("Process exited with code: {:?}", status.code().unwrap()),
                ))
                .await;
        }
        Err(e) => {
            let _ = tx
                .send(PipelineEvent::new(
                    "pipeline-exit-status-request-error".into(),
                    "error".into(),
                    format!("{e:?}").into(),
                ))
                .await;
        }
    }
}

#[cfg(test)]
mod test {
    use std::future::Future;

    use tauri::async_runtime;

    use crate::pipelines::{spawn_pipeline, Pipeline, PipelineCommand, PipelineEvent};

    fn spawn_blocking<F>(task: F)
    where
        F: Future,
    {
        tauri::async_runtime::block_on(task);
    }

    async fn spawn_test_pipeline(pipeline: Pipeline) -> Result<Vec<PipelineEvent>, String> {
        let r = async_runtime::spawn(async move {
            let _r = spawn_pipeline(Some(pipeline)).await;
            match _r {
                Ok(mut event_loop) => {
                    let mut v: Vec<PipelineEvent> = vec![];
                    while let Some(event) = event_loop.recv().await {
                        println!("{:?}", event);
                        v.push(event);
                    }
                    Ok(v)
                }
                Err(e) => Err(e),
            }
        })
        .await;

        if r.is_err() {
            return Err(format!("{:?}", r.err()).into());
        }

        let event_bus_result = r.unwrap();
        if event_bus_result.is_err() {
            return Err(format!("{:?}", event_bus_result.err()));
        }

        Ok(event_bus_result.unwrap())
    }

    #[test]
    fn run_pipeline_should_0_status_code() {
        spawn_blocking(async {
            let test_pipeline = Pipeline {
                name: "testing".into(),
                commands: vec![PipelineCommand {
                    name: "Run cURL on Endpoint".into(),
                    program: "curl".into(),
                    arguments: vec!["--version".into()],
                    after: vec![],
                }],
            };

            let events = spawn_test_pipeline(test_pipeline).await;

            assert!(events.is_ok());
        });
    }

    #[test]
    fn run_pipeline_should_2_status_code() {
        spawn_blocking(async {
            let test_pipeline = Pipeline {
                name: "testing".into(),
                commands: vec![PipelineCommand {
                    name: "Run cURL on Endpoint".into(),
                    program: "curl".into(),
                    arguments: vec!["--this-command-does-not-exist".into()],
                    after: vec![],
                }],
            };

            let events = spawn_test_pipeline(test_pipeline).await;

            assert!(events.is_ok());
        });
    }
}
