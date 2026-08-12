pub mod app;
pub mod auth;
pub mod categories;
pub mod config;
pub mod db;
pub mod entities;
pub mod error;
pub mod health;

use anyhow::Context;
use std::sync::Arc;
use tokio::net::TcpListener;
use tracing::info;
use tracing_subscriber::EnvFilter;

use crate::{
    app::{AppState, create_router},
    config::Config,
};

pub async fn run() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    init_tracing();

    let config = Arc::new(Config::from_env().context("failed to load configuration")?);

    let db = db::connect(&config)
        .await
        .context("failed to connect to PostgreSQL")?;

    let state = AppState {
        db,
        config: Arc::clone(&config),
    };

    let app = create_router(state);

    let listener = TcpListener::bind(config.bind_addr)
        .await
        .with_context(|| format!("failed to bind {}", config.bind_addr))?;

    info!(address = %config.bind_addr, "OMC backend listening");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

fn init_tracing() {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("oh_my_cash=debug,tower_http=debug"));

    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .compact()
        .init();
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        use tokio::signal::unix::{SignalKind, signal};

        let mut signal = signal(SignalKind::terminate()).expect("failed to install SITERM handler");

        signal.recv().await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("shutdown signal received");
}
