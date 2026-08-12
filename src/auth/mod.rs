pub mod dto;
pub mod extractor;
pub mod handler;
pub mod password;
pub mod service;
pub mod session;
pub mod user;

pub use user::AuthUser;

use axum::{
    Router,
    routing::{get, post},
};

use crate::app::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/login", post(handler::login))
        .route("/logout", post(handler::logout))
        .route("/session", get(handler::current_session))
        .route("/authenticated-test", get(handler::authenticated_test))
}
