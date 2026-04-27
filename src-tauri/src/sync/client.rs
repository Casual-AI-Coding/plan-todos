// WebDAV Client - handles communication with WebDAV servers
// Phase 6: WebDAV protocol implementation

use base64::Engine;
use quick_xml::events::Event;
use quick_xml::Reader;
use reqwest::header::{HeaderName, AUTHORIZATION, CONTENT_TYPE};
use reqwest::Client;
use std::time::Duration;

// WebDAV Depth header
fn depth_header() -> HeaderName {
    HeaderName::from_static("depth")
}

/// Represents a file/directory entry from WebDAV listing
#[derive(Debug, Clone)]
pub struct WebDAVItem {
    pub href: String,
    pub is_directory: bool,
    pub content_length: Option<u64>,
    pub last_modified: Option<String>,
    pub etag: Option<String>,
}

/// WebDAV client for communicating with cloud storage
pub struct WebDAVClient {
    client: Client,
    server_url: String,
    username: String,
    password: String,
    base_path: String,
}

impl WebDAVClient {
    /// Create a new WebDAV client
    pub fn new(
        server_url: String,
        username: String,
        password: String,
        base_path: String,
    ) -> Result<Self, String> {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .danger_accept_invalid_certs(false)
            .build()
            .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

        Ok(Self {
            client,
            server_url,
            username,
            password,
            base_path,
        })
    }

    /// Build the authorization header value
    fn auth_header(&self) -> String {
        let creds = format!("{}:{}", self.username, self.password);
        let encoded = base64::engine::general_purpose::STANDARD.encode(creds.as_bytes());
        format!("Basic {}", encoded)
    }

    /// Build full URL for a path
    fn build_url(&self, path: &str) -> String {
        let normalized_path = path.trim_start_matches('/');
        let normalized_base = self.base_path.trim_start_matches('/').trim_end_matches('/');

        if normalized_base.is_empty() {
            format!(
                "{}/{}",
                self.server_url.trim_end_matches('/'),
                normalized_path
            )
        } else {
            format!(
                "{}/{}/{}",
                self.server_url.trim_end_matches('/'),
                normalized_base,
                normalized_path
            )
        }
    }

    /// Test connection to the WebDAV server
    /// Uses PROPFIND on the base path to verify access
    pub async fn test_connection(&self) -> Result<bool, String> {
        let url = if self.base_path.is_empty() || self.base_path == "/" {
            self.server_url.trim_end_matches('/').to_string()
        } else {
            self.build_url("")
        };

        let response = self
            .client
            .request(reqwest::Method::from_bytes(b"PROPFIND").unwrap(), &url)
            .header(AUTHORIZATION, self.auth_header())
            .header(depth_header(), "0")
            .header(CONTENT_TYPE, "application/xml; charset=utf-8")
            .body(r#"<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop></prop></propfind>"#)
            .send()
            .await
            .map_err(|e| format!("Connection failed: {}", e))?;

        let status = response.status();
        if status.is_success() || status.as_u16() == 207 {
            Ok(true)
        } else if status.as_u16() == 401 {
            Err("Authentication failed: Invalid credentials".to_string())
        } else if status.as_u16() == 404 {
            // Path doesn't exist but server is reachable
            Err("Path not found on server. The sync directory does not exist yet.".to_string())
        } else {
            Err(format!("Connection test failed: HTTP {}", status))
        }
    }

    /// Create a directory on the WebDAV server (MKCOL)
    pub async fn create_directory(&self, path: &str) -> Result<(), String> {
        let url = self.build_url(path);

        let response = self
            .client
            .request(reqwest::Method::from_bytes(b"MKCOL").unwrap(), &url)
            .header(AUTHORIZATION, self.auth_header())
            .send()
            .await
            .map_err(|e| format!("Failed to create directory: {}", e))?;

        let status = response.status();
        if status.is_success() || status.as_u16() == 405 {
            // 405 = Method Not Allowed means directory already exists
            Ok(())
        } else {
            Err(format!("Failed to create directory: HTTP {}", status))
        }
    }

    /// Ensure base path exists, create if necessary
    pub async fn ensure_base_path(&self) -> Result<(), String> {
        if self.base_path.is_empty() || self.base_path == "/" {
            return Ok(());
        }

        // Split path and create directories recursively
        let parts: Vec<&str> = self
            .base_path
            .trim_start_matches('/')
            .trim_end_matches('/')
            .split('/')
            .filter(|s| !s.is_empty())
            .collect();

        let mut current_path = String::new();
        for part in parts {
            current_path.push('/');
            current_path.push_str(part);

            // Try to create each level
            let url = format!(
                "{}/{}",
                self.server_url.trim_end_matches('/'),
                current_path.trim_start_matches('/')
            );

            let response = self
                .client
                .request(reqwest::Method::from_bytes(b"MKCOL").unwrap(), &url)
                .header(AUTHORIZATION, self.auth_header())
                .send()
                .await
                .map_err(|e| format!("Failed to create directory: {}", e))?;

            let status = response.status();
            if !status.is_success() && status.as_u16() != 405 {
                // 405 = already exists, which is fine
                // But other errors are problematic
                if status.as_u16() != 405 {
                    return Err(format!("Failed to create base path: HTTP {}", status));
                }
            }
        }

        Ok(())
    }

    /// Upload data to WebDAV server (PUT)
    pub async fn upload(&self, path: &str, data: &[u8]) -> Result<(), String> {
        let url = self.build_url(path);

        let response = self
            .client
            .put(&url)
            .header(AUTHORIZATION, self.auth_header())
            .header(CONTENT_TYPE, "application/octet-stream")
            .body(data.to_vec())
            .send()
            .await
            .map_err(|e| format!("Failed to upload: {}", e))?;

        let status = response.status();
        if status.is_success() {
            Ok(())
        } else {
            Err(format!("Upload failed: HTTP {}", status))
        }
    }

    /// Download data from WebDAV server (GET)
    pub async fn download(&self, path: &str) -> Result<Vec<u8>, String> {
        let url = self.build_url(path);

        let response = self
            .client
            .get(&url)
            .header(AUTHORIZATION, self.auth_header())
            .send()
            .await
            .map_err(|e| format!("Failed to download: {}", e))?;

        let status = response.status();
        if status.is_success() {
            response
                .bytes()
                .await
                .map(|b| b.to_vec())
                .map_err(|e| format!("Failed to read response: {}", e))
        } else if status.as_u16() == 404 {
            Err("File not found".to_string())
        } else {
            Err(format!("Download failed: HTTP {}", status))
        }
    }

    /// List files in a directory using PROPFIND
    pub async fn list(&self, path: &str) -> Result<Vec<WebDAVItem>, String> {
        let url = self.build_url(path);

        let response = self
            .client
            .request(reqwest::Method::from_bytes(b"PROPFIND").unwrap(), &url)
            .header(AUTHORIZATION, self.auth_header())
            .header(depth_header(), "1")
            .header(CONTENT_TYPE, "application/xml; charset=utf-8")
            .body(r#"<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><displayname/><getcontentlength/><getlastmodified/><resourcetype/><getetag/></prop></propfind>"#)
            .send()
            .await
            .map_err(|e| format!("Failed to list directory: {}", e))?;

        let status = response.status();
        if !status.is_success() && status.as_u16() != 207 {
            return Err(format!("List failed: HTTP {}", status));
        }

        let body = response
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;

        parse_webdav_list_response(&body, &self.base_path)
    }

    /// Delete a file or directory (DELETE)
    pub async fn delete(&self, path: &str) -> Result<(), String> {
        let url = self.build_url(path);

        let response = self
            .client
            .delete(&url)
            .header(AUTHORIZATION, self.auth_header())
            .send()
            .await
            .map_err(|e| format!("Failed to delete: {}", e))?;

        let status = response.status();
        if status.is_success() || status.as_u16() == 404 {
            // 404 = already deleted
            Ok(())
        } else {
            Err(format!("Delete failed: HTTP {}", status))
        }
    }

    /// Check if a file exists
    pub async fn exists(&self, path: &str) -> Result<bool, String> {
        let url = self.build_url(path);

        let response = self
            .client
            .head(&url)
            .header(AUTHORIZATION, self.auth_header())
            .send()
            .await
            .map_err(|e| format!("Failed to check existence: {}", e))?;

        Ok(response.status().is_success())
    }

    /// Get file metadata (ETag, Last-Modified)
    pub async fn get_metadata(&self, path: &str) -> Result<Option<WebDAVItem>, String> {
        let url = self.build_url(path);

        let response = self
            .client
            .request(reqwest::Method::from_bytes(b"PROPFIND").unwrap(), &url)
            .header(AUTHORIZATION, self.auth_header())
            .header(depth_header(), "0")
            .header(CONTENT_TYPE, "application/xml; charset=utf-8")
            .body(r#"<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><getcontentlength/><getlastmodified/><resourcetype/><getetag/></prop></propfind>"#)
            .send()
            .await
            .map_err(|e| format!("Failed to get metadata: {}", e))?;

        let status = response.status();
        if !status.is_success() && status.as_u16() != 207 {
            return Ok(None);
        }

        let body = response
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;

        let items = parse_webdav_list_response(&body, &self.base_path)?;
        Ok(items.into_iter().next())
    }
}

/// Parse WebDAV PROPFIND response XML
fn parse_webdav_list_response(xml: &str, base_path: &str) -> Result<Vec<WebDAVItem>, String> {
    let mut items = Vec::new();
    let mut reader = Reader::from_str(xml);
    reader.config_mut().trim_text(true);

    let mut current_item: Option<WebDAVItem> = None;
    let mut current_element = String::new();
    let mut in_response = false;
    let mut in_propstat = false;

    loop {
        match reader.read_event() {
            Ok(Event::Start(e)) | Ok(Event::Empty(e)) => {
                let name = String::from_utf8_lossy(e.name().as_ref()).to_string();
                let local_name = name.split(':').last().unwrap_or(&name).to_string();

                match local_name.as_str() {
                    "response" => {
                        in_response = true;
                        current_item = Some(WebDAVItem {
                            href: String::new(),
                            is_directory: false,
                            content_length: None,
                            last_modified: None,
                            etag: None,
                        });
                    }
                    "propstat" => {
                        in_propstat = true;
                    }
                    "resourcetype" => {
                        // Check if this is a collection (directory)
                        // Look for <collection/> inside
                    }
                    "collection" => {
                        if let Some(ref mut item) = current_item {
                            item.is_directory = true;
                        }
                    }
                    _ => {
                        current_element = local_name;
                    }
                }
            }
            Ok(Event::End(e)) => {
                let name = String::from_utf8_lossy(e.name().as_ref()).to_string();
                let local_name = name.split(':').last().unwrap_or(&name).to_string();

                match local_name.as_str() {
                    "response" => {
                        in_response = false;
                        if let Some(item) = current_item.take() {
                            // Filter out the base path itself and normalize href
                            let normalized_href = normalize_href(&item.href, base_path);
                            if !normalized_href.is_empty() {
                                items.push(WebDAVItem {
                                    href: normalized_href,
                                    ..item
                                });
                            }
                        }
                    }
                    "propstat" => {
                        in_propstat = false;
                    }
                    _ => {}
                }
                current_element.clear();
            }
            Ok(Event::Text(e)) => {
                let text = e.unescape().unwrap_or_default().to_string();

                if in_response && in_propstat {
                    if let Some(ref mut item) = current_item {
                        match current_element.as_str() {
                            "href" => {
                                item.href = text;
                            }
                            "getcontentlength" => {
                                item.content_length = text.parse().ok();
                            }
                            "getlastmodified" => {
                                item.last_modified = Some(text);
                            }
                            "getetag" => {
                                item.etag = Some(text.trim_matches('"').to_string());
                            }
                            _ => {}
                        }
                    }
                }
            }
            Ok(Event::Eof) => break,
            Err(e) => {
                return Err(format!("XML parsing error: {:?}", e));
            }
            _ => {}
        }
    }

    Ok(items)
}

/// Normalize href by removing server URL and base path prefix
fn normalize_href(href: &str, base_path: &str) -> String {
    // Remove URL encoding
    let decoded = urlencoding_decode(href);

    // Remove base path prefix
    let base = base_path.trim_start_matches('/').trim_end_matches('/');
    if !base.is_empty() {
        let base_with_slash = format!("/{}", base);
        if decoded.starts_with(&base_with_slash) {
            return decoded[base_with_slash.len()..]
                .trim_start_matches('/')
                .to_string();
        }
    }

    // If href ends with /, it's the directory itself, return empty to filter out
    if decoded.ends_with('/') {
        return String::new();
    }

    decoded.trim_start_matches('/').to_string()
}

/// Simple URL decoding for href values
fn urlencoding_decode(s: &str) -> String {
    let mut result = String::new();
    let mut chars = s.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '%' {
            let hex: String = chars.by_ref().take(2).collect();
            if let Ok(code) = u8::from_str_radix(&hex, 16) {
                result.push(code as char);
            } else {
                result.push('%');
                result.push_str(&hex);
            }
        } else {
            result.push(c);
        }
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_urlencoding_decode() {
        assert_eq!(urlencoding_decode("hello"), "hello");
        assert_eq!(urlencoding_decode("%20"), " ");
        assert_eq!(urlencoding_decode("foo%20bar"), "foo bar");
        assert_eq!(urlencoding_decode("%2Fpath%2Fto%2Ffile"), "/path/to/file");
    }

    #[test]
    fn test_normalize_href() {
        assert_eq!(
            normalize_href("/plan-todos-sync/file.json", "/plan-todos-sync"),
            "file.json"
        );
        assert_eq!(
            normalize_href("/plan-todos-sync/dir/", "/plan-todos-sync"),
            ""
        );
        assert_eq!(normalize_href("file.json", ""), "file.json");
    }
}
