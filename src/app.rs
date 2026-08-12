use std::sync::Arc;

use axum::{Router, routing::get};
use sea_orm::DatabaseConnection;
use tower_cookies::CookieManagerLayer;
use tower_http::trace::TraceLayer;

use crate::{auth, categories, config::Config, health, recurring};

#[derive(Clone)]
pub struct AppState {
    pub db: DatabaseConnection,
    pub config: Arc<Config>,
}

pub fn create_router(state: AppState) -> Router {
    let api = Router::new()
        .nest("/auth", auth::router())
        .merge(categories::router())
        .merge(recurring::router());

    Router::new()
        .nest("/api/v1", api)
        .route("/health/live", get(health::live))
        .route("/health/ready", get(health::ready))
        .layer(TraceLayer::new_for_http())
        .layer(CookieManagerLayer::new())
        .with_state(state)
}
