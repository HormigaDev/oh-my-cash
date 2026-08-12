use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use sea_orm::DbErr;
use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("invalid credentials")]
    InvalidCredentials,

    #[error("authentication required")]
    Unauthorized,

    #[error("{0}")]
    BadRequest(String),

    #[error("{0}")]
    Conflict(String),

    #[error("database error")]
    Database(#[from] DbErr),

    #[error("internal server error")]
    Internal,

    #[error("resource not found")]
    NotFound,

    #[error("category name already exists")]
    CategoryNameTaken,
}

#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: ErrorBody,
}

#[derive(Debug, Serialize)]
struct ErrorBody {
    code: &'static str,
    message: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        if matches!(self, Self::Database(_) | Self::Internal) {
            tracing::error!(error = ?self, "request failed");
        }

        let (status, code, message) = match self {
            Self::InvalidCredentials => (
                StatusCode::UNAUTHORIZED,
                "INVALID_CREDENTIALS",
                "Invalid email or password".to_owned(),
            ),

            Self::Unauthorized => (
                StatusCode::UNAUTHORIZED,
                "UNAUTHORIZED",
                "Authentication required".to_owned(),
            ),

            Self::BadRequest(message) => (StatusCode::BAD_REQUEST, "BAD_REQUEST", message),

            Self::Conflict(message) => (StatusCode::CONFLICT, "CONFLICT", message),

            Self::Database(_) | Self::Internal => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "Internal server error".to_owned(),
            ),
            Self::NotFound => (
                StatusCode::NOT_FOUND,
                "NOT_FOUND",
                "Resource not found".to_owned(),
            ),

            Self::CategoryNameTaken => (
                StatusCode::CONFLICT,
                "CATEGORY_NAME_TAKEN",
                "A category with this name already exists".to_owned(),
            ),
        };

        (
            status,
            Json(ErrorResponse {
                error: ErrorBody { code, message },
            }),
        )
            .into_response()
    }
}
