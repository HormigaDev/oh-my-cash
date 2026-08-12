pub mod dto;
pub mod handler;
pub mod service;

use axum::{
    Router,
    routing::{get, patch},
};

use crate::app::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/recurring-rules", get(handler::list).post(handler::create))
        .route(
            "/recurring-rules/{id}",
            patch(handler::update).delete(handler::deactivate),
        )
}
