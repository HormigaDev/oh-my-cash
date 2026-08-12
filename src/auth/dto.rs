use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::auth::AuthUser;

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

    pub theme: String,

    pub theme_mode: String,

    pub role: String,
}

impl From<AuthUser> for AuthUserResponse {
    fn from(user: AuthUser) -> Self {
        Self {
            id: user.id,

            email: user.email,

            display_name: user.display_name,

            currency: user.currency,

            timezone: user.timezone,

            locale: user.locale,

            theme: user.theme,

            theme_mode: user.theme_mode,

            role: user.role,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct SessionResponse {
    pub user: Option<AuthUserResponse>,
}
