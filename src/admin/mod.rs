pub mod dto;
pub mod handler;
pub mod service;

use axum::{
    Router,
    routing::{get, put},
};

use crate::app::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/admin/users", get(handler::list).post(handler::create))
        .route(
            "/admin/users/{user_id}",
            put(handler::update).delete(handler::remove),
        )
}
