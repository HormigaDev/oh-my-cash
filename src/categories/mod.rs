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
        .route("/categories", get(handler::list).post(handler::create))
        .route(
            "/categories/{id}",
            patch(handler::update).delete(handler::archive),
        )
}
