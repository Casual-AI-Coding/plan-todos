// Credential Manager - secure credential storage
// Phase 6: Platform keychain integration using keyring-rs

use keyring::Entry;

/// Service name for keyring entries
const SERVICE_NAME: &str = "plan-todos-sync";

/// Manages secure storage of sync credentials using platform keychain
pub struct CredentialManager {
    service_name: String,
}

impl CredentialManager {
    pub fn new() -> Self {
        Self {
            service_name: SERVICE_NAME.to_string(),
        }
    }

    /// Save credentials securely to platform keychain
    ///
    /// Stores username and password in the OS keychain:
    /// - Windows: Windows Credential Manager
    /// - macOS: Keychain
    /// - Linux: Secret Service API (gnome-keyring, kwallet, etc.)
    pub fn save_credentials(&self, username: &str, password: &str) -> Result<(), String> {
        let entry = Entry::new(&self.service_name, username)
            .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

        entry
            .set_password(password)
            .map_err(|e| format!("Failed to save credentials: {}", e))?;

        Ok(())
    }

    /// Retrieve stored credentials from platform keychain
    ///
    /// Returns (username, password) tuple if credentials exist
    pub fn get_credentials(&self, username: &str) -> Result<String, String> {
        let entry = Entry::new(&self.service_name, username)
            .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

        entry
            .get_password()
            .map_err(|e| format!("Failed to retrieve credentials: {}", e))
    }

    /// Delete stored credentials from platform keychain
    pub fn delete_credentials(&self, username: &str) -> Result<(), String> {
        let entry = Entry::new(&self.service_name, username)
            .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

        entry
            .delete_credential()
            .map_err(|e| format!("Failed to delete credentials: {}", e))
    }

    /// Check if credentials exist for a given username
    pub fn has_credentials(&self, username: &str) -> bool {
        let entry = match Entry::new(&self.service_name, username) {
            Ok(e) => e,
            Err(_) => return false,
        };

        entry.get_password().is_ok()
    }
}

impl Default for CredentialManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_credential_manager_creation() {
        let manager = CredentialManager::new();
        assert_eq!(manager.service_name, SERVICE_NAME);
    }
}
