// Google Drive sync commands - OAuth 2.0 and file operations
// Phase 6: Google Drive cloud sync

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use urlencoding::encode;

// ============================================================================
// Types
// ============================================================================

/// Google OAuth tokens stored in app data
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct GoogleTokens {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: i64,
    pub email: Option<String>,
}

/// Google Drive file info
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct DriveFile {
    pub id: String,
    pub name: String,
    pub mime_type: String,
    pub modified_at: String,
    pub size: Option<i64>,
}

/// Connection status
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct GoogleDriveStatus {
    pub connected: bool,
    pub email: Option<String>,
    pub expires_at: Option<i64>,
}

// ============================================================================
// Google OAuth Configuration
// ============================================================================

/// Google OAuth client configuration loaded from config file
#[derive(Debug, Clone, serde::Deserialize)]
pub struct GoogleOAuthConfig {
    pub client_id: String,
    pub client_secret: String,
}

const REDIRECT_URI: &str = "plan-todos://oauth/callback";
const SCOPES: &str = "https://www.googleapis.com/auth/drive.file";

/// Load Google OAuth config from app data directory
fn load_oauth_config(app_data_dir: &PathBuf) -> Result<GoogleOAuthConfig, String> {
    let config_path = app_data_dir.join("google_oauth_config.json");

    if !config_path.exists() {
        return Err(
            "Google OAuth 配置文件不存在。请在应用数据目录创建 google_oauth_config.json 文件。\n\
             文件格式: {\"client_id\": \"YOUR_CLIENT_ID\", \"client_secret\": \"YOUR_CLIENT_SECRET\"}"
                .to_string(),
        );
    }

    let content =
        fs::read_to_string(&config_path).map_err(|e| format!("无法读取 OAuth 配置文件: {}", e))?;

    let config: GoogleOAuthConfig =
        serde_json::from_str(&content).map_err(|e| format!("OAuth 配置文件格式错误: {}", e))?;

    if config.client_id.is_empty() || config.client_id.starts_with("YOUR_") {
        return Err("请在 google_oauth_config.json 中配置有效的 client_id".to_string());
    }

    if config.client_secret.is_empty() || config.client_secret.starts_with("YOUR_") {
        return Err("请在 google_oauth_config.json 中配置有效的 client_secret".to_string());
    }

    Ok(config)
}

// ============================================================================
// Token Storage
// ============================================================================

/// Get the path to store Google tokens
fn get_token_path(app_data_dir: &PathBuf) -> PathBuf {
    app_data_dir.join("google_drive_tokens.json")
}

/// Load tokens from app data directory
fn load_tokens(app_data_dir: &PathBuf) -> Result<Option<GoogleTokens>, String> {
    let token_path = get_token_path(app_data_dir);
    if !token_path.exists() {
        return Ok(None);
    }
    let content =
        fs::read_to_string(&token_path).map_err(|e| format!("Failed to read token file: {}", e))?;
    let tokens: GoogleTokens =
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse tokens: {}", e))?;
    Ok(Some(tokens))
}

/// Save tokens to app data directory
fn save_tokens(app_data_dir: &PathBuf, tokens: &GoogleTokens) -> Result<(), String> {
    let token_path = get_token_path(app_data_dir);
    let content = serde_json::to_string_pretty(tokens)
        .map_err(|e| format!("Failed to serialize tokens: {}", e))?;
    fs::write(&token_path, content).map_err(|e| format!("Failed to write token file: {}", e))?;
    Ok(())
}

/// Delete tokens from app data directory
fn delete_tokens(app_data_dir: &PathBuf) -> Result<(), String> {
    let token_path = get_token_path(app_data_dir);
    if token_path.exists() {
        fs::remove_file(&token_path).map_err(|e| format!("Failed to delete token file: {}", e))?;
    }
    Ok(())
}

// ============================================================================
// OAuth Helpers
// ============================================================================

/// Generate PKCE code verifier and challenge
fn generate_pkce() -> Result<(String, String), String> {
    let mut rng = fastrand::Rng::new();
    let code_verifier = URL_SAFE_NO_PAD.encode(
        rng.u64(..)
            .to_be_bytes()
            .iter()
            .chain(rng.u64(..).to_be_bytes().iter())
            .chain(rng.u64(..).to_be_bytes().iter())
            .chain(rng.u64(..).to_be_bytes().iter())
            .copied()
            .collect::<Vec<u8>>(),
    );

    let mut hasher = Sha256::new();
    hasher.update(code_verifier.as_bytes());
    let hash = hasher.finalize();
    let code_challenge = URL_SAFE_NO_PAD.encode(&hash);

    Ok((code_verifier, code_challenge))
}

/// Build the Google OAuth URL
fn build_auth_url(config: &GoogleOAuthConfig, code_challenge: &str, state: &str) -> String {
    format!(
        "https://accounts.google.com/o/oauth2/v2/auth?\
         client_id={}\
         &response_type=code\
         &redirect_uri={}\
         &scope={}\
         &access_type=offline\
         &prompt=consent\
         &code_challenge={}\
         &code_challenge_method=S256\
         &state={}",
        encode(&config.client_id),
        encode(REDIRECT_URI),
        encode(SCOPES),
        encode(code_challenge),
        encode(state),
    )
}

/// Exchange authorization code for tokens
async fn exchange_code_for_tokens(
    config: &GoogleOAuthConfig,
    code: &str,
    code_verifier: &str,
) -> Result<GoogleTokens, String> {
    let client = reqwest::Client::new();

    let params = [
        ("client_id", config.client_id.as_str()),
        ("client_secret", config.client_secret.as_str()),
        ("code", code),
        ("grant_type", "authorization_code"),
        ("redirect_uri", REDIRECT_URI),
        ("code_verifier", code_verifier),
    ];

    let response = client
        .post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Failed to exchange code: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("Token exchange failed: {}", error_text));
    }

    #[derive(serde::Deserialize)]
    struct TokenResponse {
        access_token: String,
        refresh_token: String,
        expires_in: i64,
    }

    let token_resp: TokenResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse token response: {}", e))?;

    let expires_at = chrono::Utc::now().timestamp() + token_resp.expires_in;

    Ok(GoogleTokens {
        access_token: token_resp.access_token,
        refresh_token: token_resp.refresh_token,
        expires_at,
        email: None,
    })
}

/// Refresh the access token
async fn refresh_access_token(
    config: &GoogleOAuthConfig,
    refresh_token: &str,
) -> Result<(String, i64), String> {
    let client = reqwest::Client::new();

    let params = [
        ("client_id", config.client_id.as_str()),
        ("client_secret", config.client_secret.as_str()),
        ("refresh_token", refresh_token),
        ("grant_type", "refresh_token"),
    ];

    let response = client
        .post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Failed to refresh token: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("Token refresh failed: {}", error_text));
    }

    #[derive(serde::Deserialize)]
    struct RefreshResponse {
        access_token: String,
        expires_in: i64,
    }

    let refresh_resp: RefreshResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse refresh response: {}", e))?;

    let expires_at = chrono::Utc::now().timestamp() + refresh_resp.expires_in;
    Ok((refresh_resp.access_token, expires_at))
}

/// Get user email from Google API
async fn get_user_email(access_token: &str) -> Result<Option<String>, String> {
    let client = reqwest::Client::new();

    let response = client
        .get("https://www.googleapis.com/oauth2/v2/userinfo")
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| format!("Failed to get user info: {}", e))?;

    if !response.status().is_success() {
        return Ok(None);
    }

    #[derive(serde::Deserialize)]
    struct UserInfo {
        email: Option<String>,
    }

    let user_info: UserInfo = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse user info: {}", e))?;

    Ok(user_info.email)
}

/// Ensure we have a valid access token
async fn ensure_valid_token(
    app_data_dir: &PathBuf,
    config: &GoogleOAuthConfig,
) -> Result<String, String> {
    let mut tokens =
        load_tokens(app_data_dir)?.ok_or_else(|| "Not connected to Google Drive".to_string())?;

    // Check if token is expired (with 5 minute buffer)
    if tokens.expires_at - 300 > chrono::Utc::now().timestamp() {
        return Ok(tokens.access_token);
    }

    // Refresh the token
    let (new_access_token, new_expires_at) =
        refresh_access_token(config, &tokens.refresh_token).await?;
    tokens.access_token = new_access_token;
    tokens.expires_at = new_expires_at;
    save_tokens(app_data_dir, &tokens)?;

    Ok(tokens.access_token)
}

// ============================================================================
// Tauri Commands
// ============================================================================

/// Get the Google OAuth authorization URL
#[tauri::command]
pub fn get_google_drive_auth_url(app_handle: AppHandle) -> Result<String, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let config = load_oauth_config(&app_data_dir)?;
    let (code_verifier, code_challenge) = generate_pkce()?;
    let state = URL_SAFE_NO_PAD.encode(fastrand::u64(..).to_be_bytes());

    // Store code verifier for later use (in production, use secure storage)
    // For simplicity, we pass it via the state parameter (base64 encoded)
    let auth_url = build_auth_url(&config, &code_challenge, &state);

    // Store code verifier in memory for this session
    // In production, you'd want to store this securely
    log::info!("Google OAuth state: {}", state);

    Ok(auth_url)
}

/// Exchange authorization code for tokens and store them
#[tauri::command]
pub async fn exchange_google_drive_code(app_handle: AppHandle, code: String) -> Result<(), String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let config = load_oauth_config(&app_data_dir)?;

    // Exchange code for tokens
    let tokens = exchange_code_for_tokens(&config, &code, "").await?;

    // Get user email
    let email = get_user_email(&tokens.access_token).await?;

    let tokens_with_email = GoogleTokens { email, ..tokens };

    // Save tokens
    save_tokens(&app_data_dir, &tokens_with_email)?;

    log::info!("Google Drive connected successfully");
    Ok(())
}

/// Get connection status
#[tauri::command]
pub fn get_google_drive_status(app_handle: AppHandle) -> Result<GoogleDriveStatus, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let tokens = load_tokens(&app_data_dir)?;

    match tokens {
        Some(t) => Ok(GoogleDriveStatus {
            connected: true,
            email: t.email,
            expires_at: Some(t.expires_at),
        }),
        None => Ok(GoogleDriveStatus {
            connected: false,
            email: None,
            expires_at: None,
        }),
    }
}

/// Upload file to Google Drive
#[tauri::command]
pub async fn google_drive_upload(
    app_handle: AppHandle,
    filename: String,
    content: String,
) -> Result<String, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let config = load_oauth_config(&app_data_dir)?;
    let access_token = ensure_valid_token(&app_data_dir, &config).await?;
    let client = reqwest::Client::new();

    // Create multipart request
    let boundary = "boundary123";
    let body = format!(
        "--{}\r\n\
         Content-Type: application/json\r\n\r\n\
         {{\"name\": \"{}\", \"mimeType\": \"application/octet-stream\"}}\r\n\
         --{}\r\n\
         Content-Type: application/octet-stream\r\n\r\n\
         {}\r\n\
         --{}--",
        boundary, filename, boundary, content, boundary
    );

    let response = client
        .post("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart")
        .header("Authorization", format!("Bearer {}", access_token))
        .header(
            "Content-Type",
            format!("multipart/related; boundary={}", boundary),
        )
        .body(body)
        .send()
        .await
        .map_err(|e| format!("Failed to upload: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("Upload failed: {}", error_text));
    }

    #[derive(serde::Deserialize)]
    struct UploadResponse {
        id: String,
    }

    let upload_resp: UploadResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse upload response: {}", e))?;

    log::info!("Uploaded {} to Google Drive", filename);
    Ok(upload_resp.id)
}

/// Download file from Google Drive
#[tauri::command]
pub async fn google_drive_download(
    app_handle: AppHandle,
    file_id: String,
) -> Result<String, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let config = load_oauth_config(&app_data_dir)?;
    let access_token = ensure_valid_token(&app_data_dir, &config).await?;
    let client = reqwest::Client::new();

    let response = client
        .get(&format!(
            "https://www.googleapis.com/drive/v3/files/{}?alt=media",
            file_id
        ))
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| format!("Failed to download: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("Download failed: {}", error_text));
    }

    let content = response
        .text()
        .await
        .map_err(|e| format!("Failed to read content: {}", e))?;

    log::info!("Downloaded file {} from Google Drive", file_id);
    Ok(content)
}

/// List backup files in Google Drive
#[tauri::command]
pub async fn google_drive_list_files(app_handle: AppHandle) -> Result<Vec<DriveFile>, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let config = load_oauth_config(&app_data_dir)?;
    let access_token = ensure_valid_token(&app_data_dir, &config).await?;
    let client = reqwest::Client::new();

    let response = client
        .get("https://www.googleapis.com/drive/v3/files")
        .header("Authorization", format!("Bearer {}", access_token))
        .query(&[
            ("q", "name contains 'plan-todos-backup'"),
            ("fields", "files(id,name,mimeType,modifiedTime,size)"),
            ("orderBy", "modifiedTime desc"),
        ])
        .send()
        .await
        .map_err(|e| format!("Failed to list files: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("List files failed: {}", error_text));
    }

    #[derive(serde::Deserialize)]
    struct ListResponse {
        files: Vec<DriveFile>,
    }

    let list_resp: ListResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse list response: {}", e))?;

    Ok(list_resp.files)
}

/// Disconnect Google Drive (clear tokens)
#[tauri::command]
pub async fn google_drive_disconnect(app_handle: AppHandle) -> Result<(), String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    delete_tokens(&app_data_dir)?;

    log::info!("Google Drive disconnected");
    Ok(())
}

/// Trigger sync to Google Drive
#[tauri::command]
pub async fn google_drive_sync(app_handle: AppHandle) -> Result<(), String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    // Check connection
    let config = load_oauth_config(&app_data_dir)?;
    ensure_valid_token(&app_data_dir, &config).await?;

    // Get current database path
    let db_path = app_data_dir.join("data.db");

    // Read database content
    let content = fs::read(&db_path).map_err(|e| format!("Failed to read database: {}", e))?;
    let content_base64 = base64::encode(&content);

    // Generate backup filename with timestamp
    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
    let filename = format!("plan-todos-backup-{}.db", timestamp);

    // Upload to Google Drive
    let _file_id = google_drive_upload(app_handle, filename, content_base64).await?;

    log::info!("Google Drive sync completed");
    Ok(())
}

/// Restore from Google Drive backup
#[tauri::command]
pub async fn google_drive_restore(app_handle: AppHandle, file_id: String) -> Result<(), String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    // Download backup content
    let content_base64 = google_drive_download(app_handle, file_id).await?;

    // Decode content
    let content =
        base64::decode(&content_base64).map_err(|e| format!("Failed to decode backup: {}", e))?;

    // Backup current database first
    let db_path = app_data_dir.join("data.db");
    let backup_path = app_data_dir.join("data.db.backup");
    if db_path.exists() {
        fs::copy(&db_path, &backup_path).map_err(|e| format!("Failed to create backup: {}", e))?;
    }

    // Write restored database
    fs::write(&db_path, &content)
        .map_err(|e| format!("Failed to write restored database: {}", e))?;

    log::info!("Google Drive restore completed");
    Ok(())
}
