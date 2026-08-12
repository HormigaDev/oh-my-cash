use sea_orm::{ConnectOptions, Database, DatabaseConnection};

use crate::config::Config;

pub async fn connect(config: &Config) -> Result<DatabaseConnection, sea_orm::DbErr> {
    let mut options = ConnectOptions::new(config.database_url.clone());

    options
        .max_connections(20)
        .min_connections(1)
        .sqlx_logging(false);

    Database::connect(options).await
}
