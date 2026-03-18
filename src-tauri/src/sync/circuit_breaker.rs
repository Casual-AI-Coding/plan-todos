// Circuit Breaker pattern for sync operations
// Phase 6: Prevent cascading failures during sync

use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

/// Circuit breaker states
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CircuitState {
    /// Circuit is closed, operations are allowed
    Closed,
    /// Circuit is open, operations are rejected
    Open,
    /// Circuit is half-open, testing if operations can resume
    HalfOpen,
}

/// Configuration for circuit breaker behavior
#[derive(Debug, Clone)]
pub struct CircuitBreakerConfig {
    /// Number of consecutive failures before opening circuit
    pub failure_threshold: u32,
    /// Time to wait before transitioning from Open to HalfOpen
    pub reset_timeout: Duration,
    /// Number of successful operations in HalfOpen to close circuit
    pub success_threshold: u32,
    /// Time window for counting failures (rolling window)
    pub failure_window: Duration,
}

impl Default for CircuitBreakerConfig {
    fn default() -> Self {
        Self {
            failure_threshold: 5,
            reset_timeout: Duration::from_secs(30),
            success_threshold: 2,
            failure_window: Duration::from_secs(60),
        }
    }
}

/// Circuit breaker for protecting sync operations
#[derive(Debug)]
pub struct CircuitBreaker {
    config: CircuitBreakerConfig,
    state: Arc<AtomicState>,
    failure_count: Arc<AtomicU64>,
    success_count: Arc<AtomicU64>,
    last_failure_time: Arc<AtomicU64>,
    last_state_change: Arc<AtomicU64>,
}

/// Packed atomic state for efficient storage
/// Bits 0-1: CircuitState enum
/// Bits 2-31: Reserved
#[derive(Debug)]
struct AtomicState {
    inner: AtomicU64,
}

impl AtomicState {
    fn new(state: CircuitState) -> Self {
        Self {
            inner: AtomicU64::new(state as u64),
        }
    }

    fn load(&self) -> CircuitState {
        match self.inner.load(Ordering::SeqCst) & 0b11 {
            0 => CircuitState::Closed,
            1 => CircuitState::Open,
            2 => CircuitState::HalfOpen,
            _ => CircuitState::Closed,
        }
    }

    fn store(&self, state: CircuitState) {
        self.inner.store(state as u64, Ordering::SeqCst);
    }
}

impl CircuitBreaker {
    /// Create a new circuit breaker with the given configuration
    pub fn new(config: CircuitBreakerConfig) -> Self {
        Self {
            config,
            state: Arc::new(AtomicState::new(CircuitState::Closed)),
            failure_count: Arc::new(AtomicU64::new(0)),
            success_count: Arc::new(AtomicU64::new(0)),
            last_failure_time: Arc::new(AtomicU64::new(0)),
            last_state_change: Arc::new(AtomicU64::new(Instant::now().elapsed().as_nanos() as u64)),
        }
    }

    /// Create a new circuit breaker with default configuration
    pub fn with_defaults() -> Self {
        Self::new(CircuitBreakerConfig::default())
    }

    /// Get current circuit state
    pub fn state(&self) -> CircuitState {
        let current_state = self.state.load();

        // Check if we should transition from Open to HalfOpen
        if current_state == CircuitState::Open {
            let last_change = Instant::now().elapsed().as_nanos() as u64
                - self.last_state_change.load(Ordering::SeqCst);

            if Duration::from_nanos(last_change) >= self.config.reset_timeout {
                self.transition_to(CircuitState::HalfOpen);
                return CircuitState::HalfOpen;
            }
        }

        current_state
    }

    /// Check if an operation is allowed to proceed
    pub fn is_call_allowed(&self) -> bool {
        match self.state() {
            CircuitState::Closed => true,
            CircuitState::Open => false,
            CircuitState::HalfOpen => true,
        }
    }

    /// Record a successful operation
    pub fn record_success(&self) {
        let current_state = self.state.load();

        match current_state {
            CircuitState::Closed => {
                // Reset failure count on success
                self.failure_count.store(0, Ordering::SeqCst);
            }
            CircuitState::HalfOpen => {
                let successes = self.success_count.fetch_add(1, Ordering::SeqCst) + 1;

                if successes >= self.config.success_threshold as u64 {
                    self.transition_to(CircuitState::Closed);
                }
            }
            CircuitState::Open => {
                // Shouldn't happen, but handle gracefully
            }
        }
    }

    /// Record a failed operation
    pub fn record_failure(&self) {
        let current_state = self.state.load();

        match current_state {
            CircuitState::Closed => {
                let now = Instant::now().elapsed().as_nanos() as u64;
                let last_failure = self.last_failure_time.load(Ordering::SeqCst);

                // Check if failure is within the window
                if Duration::from_nanos(now - last_failure) <= self.config.failure_window {
                    let failures = self.failure_count.fetch_add(1, Ordering::SeqCst) + 1;

                    if failures >= self.config.failure_threshold as u64 {
                        self.transition_to(CircuitState::Open);
                    }
                } else {
                    // Reset counter if outside window
                    self.failure_count.store(1, Ordering::SeqCst);
                }

                self.last_failure_time.store(now, Ordering::SeqCst);
            }
            CircuitState::HalfOpen => {
                // Any failure in half-open goes back to open
                self.transition_to(CircuitState::Open);
            }
            CircuitState::Open => {
                // Already open, nothing to do
            }
        }
    }

    /// Reset the circuit breaker to closed state
    pub fn reset(&self) {
        self.transition_to(CircuitState::Closed);
        self.failure_count.store(0, Ordering::SeqCst);
        self.success_count.store(0, Ordering::SeqCst);
    }

    /// Force open the circuit breaker
    pub fn trip(&self) {
        self.transition_to(CircuitState::Open);
    }

    /// Transition to a new state
    fn transition_to(&self, new_state: CircuitState) {
        let old_state = self.state.load();

        if old_state != new_state {
            log::info!(
                "Circuit breaker transitioning from {:?} to {:?}",
                old_state,
                new_state
            );

            self.state.store(new_state);
            self.last_state_change
                .store(Instant::now().elapsed().as_nanos() as u64, Ordering::SeqCst);

            // Reset counters on state change
            match new_state {
                CircuitState::Closed => {
                    self.failure_count.store(0, Ordering::SeqCst);
                    self.success_count.store(0, Ordering::SeqCst);
                }
                CircuitState::HalfOpen => {
                    self.success_count.store(0, Ordering::SeqCst);
                }
                CircuitState::Open => {
                    // Keep failure count for informational purposes
                }
            }
        }
    }

    /// Get the current failure count
    pub fn failure_count(&self) -> u64 {
        self.failure_count.load(Ordering::SeqCst)
    }

    /// Get the current success count (for half-open state)
    pub fn success_count(&self) -> u64 {
        self.success_count.load(Ordering::SeqCst)
    }
}

/// Error returned when circuit is open
#[derive(Debug)]
pub struct CircuitOpenError;

impl std::fmt::Display for CircuitOpenError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Circuit breaker is open")
    }
}

impl std::error::Error for CircuitOpenError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_initial_state_closed() {
        let cb = CircuitBreaker::with_defaults();
        assert_eq!(cb.state(), CircuitState::Closed);
        assert!(cb.is_call_allowed());
    }

    #[test]
    fn test_opens_after_threshold() {
        let config = CircuitBreakerConfig {
            failure_threshold: 3,
            failure_window: Duration::from_secs(60),
            ..Default::default()
        };
        let cb = CircuitBreaker::new(config);

        cb.record_failure();
        assert_eq!(cb.state(), CircuitState::Closed);

        cb.record_failure();
        assert_eq!(cb.state(), CircuitState::Closed);

        cb.record_failure();
        assert_eq!(cb.state(), CircuitState::Open);
        assert!(!cb.is_call_allowed());
    }

    #[test]
    fn test_success_resets_failure_count() {
        let config = CircuitBreakerConfig {
            failure_threshold: 3,
            ..Default::default()
        };
        let cb = CircuitBreaker::new(config);

        cb.record_failure();
        cb.record_failure();
        cb.record_success();

        assert_eq!(cb.failure_count(), 0);
        assert_eq!(cb.state(), CircuitState::Closed);
    }

    #[test]
    fn test_reset() {
        let config = CircuitBreakerConfig {
            failure_threshold: 2,
            ..Default::default()
        };
        let cb = CircuitBreaker::new(config);

        cb.record_failure();
        cb.record_failure();
        assert_eq!(cb.state(), CircuitState::Open);

        cb.reset();
        assert_eq!(cb.state(), CircuitState::Closed);
        assert!(cb.is_call_allowed());
    }
}
