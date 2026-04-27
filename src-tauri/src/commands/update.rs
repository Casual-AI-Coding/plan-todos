// Update commands module - GitHub Releases API for auto-update checking

use chrono::{DateTime, Duration, Utc};
use semver::Version;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

/// Update information returned by check_for_updates
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub has_update: bool,
    pub current_version: String,
    pub latest_version: String,
    pub release_url: String,
    pub release_notes: String,
}

/// Last check timestamp stored in file
#[derive(Debug, Serialize, Deserialize)]
struct LastCheck {
    timestamp: DateTime<Utc>,
}

/// GitHub API response for latest release
#[derive(Debug, Deserialize)]
struct GitHubRelease {
    tag_name: String,
    html_url: String,
    body: Option<String>,
}

/// File to store skipped version
#[derive(Debug, Serialize, Deserialize)]
struct SkippedVersion {
    version: String,
}

/// Get the app data directory for storing update check files
fn get_update_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    let update_dir = data_dir.join("updates");

    if !update_dir.exists() {
        fs::create_dir_all(&update_dir)
            .map_err(|e| format!("Failed to create updates directory: {}", e))?;
    }

    Ok(update_dir)
}

/// Get path to the last check timestamp file
fn get_last_check_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(get_update_data_dir(app)?.join("last_check.json"))
}

/// Get path to the skipped version file
fn get_skip_version_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(get_update_data_dir(app)?.join(".skip_version"))
}

/// Read the last check timestamp
async fn read_last_check(app: &AppHandle) -> Result<Option<DateTime<Utc>>, String> {
    let path = get_last_check_path(app)?;

    if !path.exists() {
        return Ok(None);
    }

    let content =
        fs::read_to_string(&path).map_err(|e| format!("Failed to read last check file: {}", e))?;

    let last_check: LastCheck = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse last check file: {}", e))?;

    Ok(Some(last_check.timestamp))
}

/// Write the last check timestamp
async fn write_last_check(app: &AppHandle) -> Result<(), String> {
    let path = get_last_check_path(app)?;

    let last_check = LastCheck {
        timestamp: Utc::now(),
    };

    let content = serde_json::to_string_pretty(&last_check)
        .map_err(|e| format!("Failed to serialize last check: {}", e))?;

    fs::write(&path, content).map_err(|e| format!("Failed to write last check file: {}", e))?;

    Ok(())
}

/// Read the skipped version
async fn read_skipped_version(app: &AppHandle) -> Result<Option<String>, String> {
    let path = get_skip_version_path(app)?;

    if !path.exists() {
        return Ok(None);
    }

    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read skip version file: {}", e))?;

    let skipped: SkippedVersion = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse skip version file: {}", e))?;

    Ok(Some(skipped.version))
}

/// Check if 24 hours have passed since last check
async fn should_check(app: &AppHandle) -> Result<bool, String> {
    match read_last_check(app).await? {
        None => Ok(true),
        Some(last_check) => {
            let now = Utc::now();
            let elapsed = now - last_check;
            Ok(elapsed > Duration::hours(24))
        }
    }
}

/// Fetch latest release from GitHub API
async fn fetch_latest_release() -> Result<GitHubRelease, String> {
    let url = "https://api.github.com/repos/oGsLP/plan-todos/releases/latest";

    let client = reqwest::Client::builder()
        .user_agent("Plan-Todos-App/1.0")
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .get(url)
        .header("Accept", "application/vnd.github+json")
        .send()
        .await
        .map_err(|e| format!("Failed to fetch GitHub release: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("GitHub API returned error: {}", response.status()));
    }

    let release: GitHubRelease = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse GitHub release response: {}", e))?;

    Ok(release)
}

/// Check for application updates
#[tauri::command]
pub async fn check_for_updates(app: AppHandle) -> Result<Option<UpdateInfo>, String> {
    // Check if we should perform a new check (throttle to once per 24h)
    if !should_check(&app).await? {
        log::info!("Update check throttled - last check was within 24 hours");
        return Ok(None);
    }

    // Get current version from app
    let current_version_str = app.package_info().version.to_string();
    let current_version = Version::parse(&current_version_str)
        .map_err(|e| format!("Failed to parse current version: {}", e))?;

    // Fetch latest release from GitHub
    let release = fetch_latest_release().await?;

    // Parse the tag_name (remove 'v' prefix if present)
    let latest_version_str = release.tag_name.trim_start_matches('v');
    let latest_version = Version::parse(latest_version_str)
        .map_err(|e| format!("Failed to parse latest version from GitHub: {}", e))?;

    // Check if current version is already skipped
    if let Some(skipped) = read_skipped_version(&app).await? {
        if skipped == latest_version_str {
            log::info!("Latest version {} is skipped", latest_version_str);
            // Still update the last check time
            write_last_check(&app).await?;
            return Ok(None);
        }
    }

    // Compare versions
    let has_update = latest_version > current_version;

    // Update last check timestamp
    write_last_check(&app).await?;

    if has_update {
        log::info!(
            "Update available: {} -> {}",
            current_version_str,
            latest_version_str
        );

        Ok(Some(UpdateInfo {
            has_update: true,
            current_version: current_version_str,
            latest_version: latest_version_str.to_string(),
            release_url: release.html_url,
            release_notes: release.body.unwrap_or_default(),
        }))
    } else {
        log::info!(
            "No update available - current version {} is latest",
            current_version_str
        );
        Ok(None)
    }
}

/// Skip a specific version (stores it so it won't be shown again)
#[tauri::command]
pub async fn skip_version(app: AppHandle, version: String) -> Result<(), String> {
    let path = get_skip_version_path(&app)?;

    let skipped = SkippedVersion {
        version: version.clone(),
    };

    let content = serde_json::to_string_pretty(&skipped)
        .map_err(|e| format!("Failed to serialize skip version: {}", e))?;

    fs::write(&path, content).map_err(|e| format!("Failed to write skip version file: {}", e))?;

    log::info!("Version {} has been skipped", version);

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version_parsing() {
        let v1 = Version::parse("0.6.3").unwrap();
        let v2 = Version::parse("0.7.0").unwrap();
        let v3 = Version::parse("0.6.3").unwrap();

        assert!(v2 > v1);
        assert!(v1 == v3);
    }

    #[test]
    fn test_version_parsing_with_v_prefix() {
        let v1 = Version::parse("v0.6.3").unwrap();
        let v2 = Version::parse("0.7.0").unwrap();

        assert!(v2 > v1);
    }
}
