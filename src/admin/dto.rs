use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct ListUsersQuery {
    #[serde(flatten)]
    pub pagination: crate::pagination::PaginationQuery,
}

#[derive(Debug, Serialize)]
pub struct ManagedUserResponse {
    pub id: Uuid,
    pub email: String,
    pub display_name: Option<String>,
    pub role: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    pub email: String,
    #[serde(default)]
    pub display_name: Option<String>,
    pub password: String,
    pub administrator_password: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserRequest {
    pub email: String,
    #[serde(default)]
    pub display_name: Option<String>,
    #[serde(default)]
    pub new_password: Option<String>,
    pub administrator_password: String,
}

#[derive(Debug, Deserialize)]
pub struct DeleteUserRequest {
    pub administrator_password: String,
}
