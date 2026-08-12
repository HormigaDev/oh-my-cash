pub mod dto;
pub mod handler;
pub mod service;

use axum::{
    Router,
    routing::{patch, put},
};

use crate::app::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/account/profile", put(handler::update_profile))
        .route("/account/appearance", put(handler::update_appearance))
        .route("/account/password", patch(handler::change_password))
}
