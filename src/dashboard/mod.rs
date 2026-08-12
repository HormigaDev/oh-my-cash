pub mod dto;
pub mod handler;
pub mod service;

use axum::{Router, routing::get};

use crate::app::AppState;

pub fn router() -> Router<AppState> {
    Router::new().route("/dashboard", get(handler::get))
}
