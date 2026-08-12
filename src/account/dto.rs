use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub email: String,
    #[serde(default)]
    pub display_name: Option<String>,
    pub currency: String,
    pub timezone: String,
    pub locale: String,
}

#[derive(Debug, Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAppearanceRequest {
    pub theme: String,
    pub theme_mode: String,
}
