use axum::{
    Json,
    body::to_bytes,
    extract::Request,
    http::StatusCode,
    middleware::Next,
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

    #[error("invalid transaction state")]
    InvalidTransactionState,

    #[error("idempotency conflict")]
    IdempotencyConflict,
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

#[derive(Debug, Serialize)]
pub struct SuccessResponse {
    pub status: &'static str,
}

impl SuccessResponse {
    pub const fn ok() -> Self {
        Self { status: "ok" }
    }
}

pub async fn ensure_json_response(request: Request, next: Next) -> Response {
    let response = next.run(request).await;
    if !response.status().is_client_error() && !response.status().is_server_error() {
        return response;
    }
    if response
        .headers()
        .get(axum::http::header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .is_some_and(|value| value.starts_with("application/json"))
    {
        return response;
    }

    let status = response.status();
    let (parts, body) = response.into_parts();
    let message = to_bytes(body, 64 * 1024)
        .await
        .ok()
        .and_then(|bytes| String::from_utf8(bytes.to_vec()).ok())
        .filter(|message| !message.trim().is_empty())
        .unwrap_or_else(|| {
            status
                .canonical_reason()
                .unwrap_or("Request failed")
                .to_owned()
        });
    let code = match status {
        StatusCode::BAD_REQUEST => "BAD_REQUEST",
        StatusCode::UNAUTHORIZED => "UNAUTHORIZED",
        StatusCode::FORBIDDEN => "FORBIDDEN",
        StatusCode::NOT_FOUND => "NOT_FOUND",
        StatusCode::METHOD_NOT_ALLOWED => "METHOD_NOT_ALLOWED",
        StatusCode::CONFLICT => "CONFLICT",
        StatusCode::UNPROCESSABLE_ENTITY => "UNPROCESSABLE_ENTITY",
        _ if status.is_server_error() => "INTERNAL_SERVER_ERROR",
        _ => "REQUEST_FAILED",
    };
    let mut json_response = Json(ErrorResponse {
        error: ErrorBody { code, message },
    })
    .into_response();
    *json_response.status_mut() = status;
    for (name, value) in &parts.headers {
        if name != axum::http::header::CONTENT_TYPE && name != axum::http::header::CONTENT_LENGTH {
            json_response.headers_mut().insert(name, value.clone());
        }
    }
    json_response
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

            Self::InvalidTransactionState => (
                StatusCode::CONFLICT,
                "INVALID_TRANSACTION_STATE",
                "Transaction cannot perform this operation in its current state".to_owned(),
            ),

            Self::IdempotencyConflict => (
                StatusCode::CONFLICT,
                "IDEMPOTENCY_CONFLICT",
                "Operation identifier was already used for another transaction".to_owned(),
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
