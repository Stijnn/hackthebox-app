use std::process::Command;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub(crate) struct NmapArguments {
    arguments: Vec<String>,
}

pub(super) fn run_nmap(context: NmapArguments) -> Result<(), ()> {
    run_nmap_elevated(context.arguments)
}

pub(super) fn run_nmap_elevated(arguments: Vec<String>) -> Result<(), ()> {
    #[cfg(target_os = "linux")]
    let mut cmd = Command::new("pkexec");

    #[cfg(target_os = "macos")]
    let mut cmd = Command::new("osascript");

    if cfg!(target_os = "linux") {
        cmd.arg("nmap").args(arguments);
    } else if cfg!(target_os = "macos") {
        // macOS requires the whole command as a single string string
        let full_cmd = format!("nmap {}", arguments.join(" "));
        cmd.args(&[
            "-e",
            &format!(
                "do shell script \"{}\" with administrator privileges",
                full_cmd
            ),
        ]);
    }

    let status = cmd.status().map_err(|_| ())?;
    if status.success() {
        Ok(())
    } else {
        Err(())
    }
}
