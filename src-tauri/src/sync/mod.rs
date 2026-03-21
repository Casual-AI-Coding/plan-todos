// Sync module - cloud synchronization engine
// Phase 6: WebDAV-based cloud sync with conflict resolution

pub mod circuit_breaker;
pub mod change_tracker;
pub mod client;
pub mod conflict;
pub mod credentials;
pub mod delta;
pub mod engine;
pub mod retry;
pub mod serializer;
pub mod state;

pub use circuit_breaker::{CircuitBreaker, CircuitBreakerConfig, CircuitState};
pub use change_tracker::ChangeTracker;
pub use client::WebDAVClient;
pub use conflict::{ConflictResolution, ConflictResolver};
pub use credentials::CredentialManager;
pub use delta::DeltaCalculator;
pub use engine::SyncEngine;
pub use retry::{RetryConfig, RetryResult, retry_with_backoff};
pub use serializer::SyncSerializer;
pub use state::{SyncState, SyncStatus};