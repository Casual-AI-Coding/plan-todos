// Retry logic with exponential backoff and jitter
// Phase 6: Robust error handling for sync operations

use std::future::Future;
use std::time::Duration;

/// Configuration for retry behavior
#[derive(Debug, Clone)]
pub struct RetryConfig {
    /// Maximum number of retry attempts
    pub max_attempts: u32,
    /// Initial delay between retries
    pub initial_delay: Duration,
    /// Maximum delay between retries
    pub max_delay: Duration,
    /// Multiplier for exponential backoff
    pub multiplier: f64,
    /// Whether to add jitter to delays
    pub with_jitter: bool,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            initial_delay: Duration::from_millis(500),
            max_delay: Duration::from_secs(30),
            multiplier: 2.0,
            with_jitter: true,
        }
    }
}

impl RetryConfig {
    /// Create a new retry config with custom max attempts
    pub fn with_max_attempts(mut self, attempts: u32) -> Self {
        self.max_attempts = attempts;
        self
    }

    /// Create a new retry config with custom initial delay
    pub fn with_initial_delay(mut self, delay: Duration) -> Self {
        self.initial_delay = delay;
        self
    }

    /// Calculate delay for a given attempt number
    pub fn delay_for_attempt(&self, attempt: u32) -> Duration {
        let base_delay =
            self.initial_delay.as_secs_f64() * self.multiplier.powi(attempt as i32 - 1);

        let delay_secs = base_delay.min(self.max_delay.as_secs_f64());

        if self.with_jitter {
            // Add random jitter between 0% and 25%
            let jitter = fastrand::f64() * 0.25;
            let jittered = delay_secs * (1.0 + jitter);
            Duration::from_secs_f64(jittered)
        } else {
            Duration::from_secs_f64(delay_secs)
        }
    }
}

/// Result of a retry operation
#[derive(Debug)]
pub enum RetryResult<T> {
    /// Operation succeeded
    Success(T),
    /// Operation failed after all retries
    Exhausted { attempts: u32, last_error: String },
}

/// Retry a fallible async operation with exponential backoff
pub async fn retry_with_backoff<F, Fut, T, E>(
    config: &RetryConfig,
    mut operation: F,
) -> RetryResult<T>
where
    F: FnMut() -> Fut,
    Fut: Future<Output = Result<T, E>>,
    E: std::fmt::Display,
{
    let mut attempts = 0;
    let mut last_error = String::new();

    while attempts < config.max_attempts {
        attempts += 1;

        match operation().await {
            Ok(result) => return RetryResult::Success(result),
            Err(e) => {
                last_error = e.to_string();

                if attempts < config.max_attempts {
                    let delay = config.delay_for_attempt(attempts);
                    log::warn!(
                        "Retry attempt {} failed: {}. Waiting {:?} before retry...",
                        attempts,
                        last_error,
                        delay
                    );
                    tokio::time::sleep(delay).await;
                }
            }
        }
    }

    RetryResult::Exhausted {
        attempts,
        last_error,
    }
}

/// Retry a fallible async operation with a custom predicate
pub async fn retry_if<F, Fut, T, E, P>(
    config: &RetryConfig,
    mut operation: F,
    mut should_retry: P,
) -> RetryResult<T>
where
    F: FnMut() -> Fut,
    Fut: Future<Output = Result<T, E>>,
    E: std::fmt::Display,
    P: FnMut(&E) -> bool,
{
    let mut attempts = 0;
    let mut last_error = String::new();

    while attempts < config.max_attempts {
        attempts += 1;

        match operation().await {
            Ok(result) => return RetryResult::Success(result),
            Err(e) => {
                last_error = e.to_string();

                // Check if we should retry this error
                if !should_retry(&e) {
                    log::warn!("Error is not retryable: {}", last_error);
                    break;
                }

                if attempts < config.max_attempts {
                    let delay = config.delay_for_attempt(attempts);
                    log::warn!(
                        "Retry attempt {} failed: {}. Waiting {:?} before retry...",
                        attempts,
                        last_error,
                        delay
                    );
                    tokio::time::sleep(delay).await;
                }
            }
        }
    }

    RetryResult::Exhausted {
        attempts,
        last_error,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_delay_calculation() {
        let config = RetryConfig::default();

        // First attempt should be close to initial delay
        let delay1 = config.delay_for_attempt(1);
        assert!(delay1 >= Duration::from_millis(500));
        assert!(delay1 <= Duration::from_millis(700)); // With jitter

        // Second attempt should be roughly doubled
        let delay2 = config.delay_for_attempt(2);
        assert!(delay2 >= Duration::from_millis(1000));
        assert!(delay2 <= Duration::from_millis(1300)); // With jitter
    }

    #[test]
    fn test_max_delay_cap() {
        let config = RetryConfig {
            max_delay: Duration::from_secs(5),
            ..Default::default()
        };

        // Very high attempt should be capped
        let delay = config.delay_for_attempt(100);
        assert!(delay <= Duration::from_secs_f64(5.0 * 1.25)); // With jitter
    }

    #[tokio::test]
    async fn test_retry_success() {
        let config = RetryConfig::default().with_max_attempts(3);
        let mut call_count = 0;

        let result = retry_with_backoff(&config, || async {
            call_count += 1;
            if call_count < 2 {
                Err("temporary error")
            } else {
                Ok(42)
            }
        })
        .await;

        match result {
            RetryResult::Success(value) => assert_eq!(value, 42),
            _ => panic!("Expected success"),
        }
    }

    #[tokio::test]
    async fn test_retry_exhausted() {
        let config = RetryConfig {
            max_attempts: 2,
            initial_delay: Duration::from_millis(10),
            max_delay: Duration::from_millis(100),
            multiplier: 2.0,
            with_jitter: false,
        };

        let result =
            retry_with_backoff(&config, || async { Err::<i32, &str>("permanent error") }).await;

        match result {
            RetryResult::Exhausted { attempts, .. } => assert_eq!(attempts, 2),
            _ => panic!("Expected exhausted"),
        }
    }
}
