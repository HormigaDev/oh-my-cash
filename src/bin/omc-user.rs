use std::env;

use sea_orm::{ColumnTrait, Database, EntityTrait, NotSet, QueryFilter, Set};
use time::OffsetDateTime;

use oh_my_cash::{auth::password, entities::users};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    let email = env::args()
        .nth(1)
        .ok_or_else(|| anyhow::anyhow!("usage: cargo run --bin omc-user -- <email>"))?
        .trim()
        .to_lowercase();

    if !email.contains('@') {
        anyhow::bail!("invalid email");
    }

    let password = rpassword::prompt_password("Password: ")?;

    let confirmation = rpassword::prompt_password("Repeat password: ")?;

    if password != confirmation {
        anyhow::bail!("passwords do not match");
    }

    let database_url = env::var("DATABASE_URL")?;

    let db = Database::connect(database_url).await?;

    let exists = users::Entity::find()
        .filter(users::Column::Email.eq(email.clone()))
        .one(&db)
        .await?
        .is_some();

    if exists {
        anyhow::bail!("user already exists");
    }

    let password_hash = password::hash_password(password)
        .await
        .map_err(|error| anyhow::anyhow!(error))?;

    let now = OffsetDateTime::now_utc();

    let user_model = users::ActiveModel {
        id: NotSet,

        email: Set(email),

        password_hash: Set(password_hash),

        display_name: Set(None),

        currency: Set("BRL".to_owned()),

        timezone: Set("America/Sao_Paulo".to_owned()),

        locale: Set("pt-BR".to_owned()),

        is_active: Set(true),

        password_changed_at: Set(Some(now)),

        last_login_at: Set(None),

        created_at: NotSet,

        updated_at: NotSet,
    };

    let user = users::Entity::insert(user_model)
        .exec_with_returning(&db)
        .await?;

    println!("Created OMC user {} ({})", user.email, user.id,);

    Ok(())
}
