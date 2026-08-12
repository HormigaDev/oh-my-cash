use axum::{Json, extract::State, http::StatusCode};
use sea_orm::ConnectionTrait;
use serde::Serialize;

use crate::app::AppState;

#[derive(Serialize)]
pub struct HealthResponse {
    status: &'static str,
}

pub async fn live() -> Json<HealthResponse> {
    Json(HealthResponse { status: "ok" })
}

pub async fn ready(State(state): State<AppState>) -> Result<Json<HealthResponse>, StatusCode> {
    state
        .db
        .execute_unprepared("SELECT 1")
        .await
        .map_err(|error| {
            tracing::error!(?error, "PostgreSQL readiness check failed");

            StatusCode::SERVICE_UNAVAILABLE
        })?;

    Ok(Json(HealthResponse { status: "ok" }))
}
