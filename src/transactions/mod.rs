pub mod dto;
pub mod handler;
pub mod service;

use axum::{
    Router,
    routing::{get, patch, post},
};

use crate::app::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/transactions", get(handler::list).post(handler::create))
        .route("/transactions/{id}", patch(handler::update))
        .route("/transactions/{id}/pay", post(handler::pay))
        .route("/transactions/{id}/skip", post(handler::skip))
        .route("/transactions/{id}/cancel", post(handler::cancel))
}
