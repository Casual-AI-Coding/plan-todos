// Command logging utilities

/// Helper macro to log command execution
#[macro_export]
macro_rules! log_command {
    ($command_name:expr, $body:block) => {{
        use std::time::Instant;
        let start = Instant::now();
        let result = (|| $body)();
        let elapsed = start.elapsed().as_millis();

        match &result {
            Ok(_) => log::info!("[API] {} - {}ms - ok", $command_name, elapsed),
            Err(e) => log::info!("[API] {} - {}ms - err: {}", $command_name, elapsed, e),
        }

        result
    }};
}
