use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Clone, Debug, Serialize)]
pub struct AuthUserResponse {
    pub id: Uuid,
    pub email: String,

    pub display_name: Option<String>,

    pub currency: String,
    pub timezone: String,
    pub locale: String,
}

#[derive(Debug, Serialize)]
pub struct SessionResponse {
    pub user: Option<AuthUserResponse>,
}
