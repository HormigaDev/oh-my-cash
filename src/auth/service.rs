use sea_orm::{ActiveModelTrait, ActiveValue::NotSet, ColumnTrait, EntityTrait, QueryFilter, Set};
use time::{Duration, OffsetDateTime};

use crate::{
    app::AppState,
    auth::{
        AuthUser,
        dto::LoginRequest,
        password,
        session::{generate_session_token, hash_session_token},
    },
    entities::{auth_sessions, users},
    error::AppError,
};

pub struct LoginResult {
    pub user: AuthUser,
    pub session_token: String,
}

pub async fn login(
    state: &AppState,
    request: LoginRequest,
    user_agent: Option<String>,
    ip_address: Option<String>,
) -> Result<LoginResult, AppError> {
    let email = normalize_email(&request.email)?;

    let user = users::Entity::find()
        .filter(users::Column::Email.eq(email))
        .one(&state.db)
        .await?
        .ok_or(AppError::InvalidCredentials)?;

    if !user.is_active {
        return Err(AppError::InvalidCredentials);
    }

    let valid = password::verify_password(request.password, user.password_hash.clone()).await?;

    if !valid {
        return Err(AppError::InvalidCredentials);
    }

    let raw_token = generate_session_token()?;

    let token_hash = hash_session_token(&raw_token);

    let now = OffsetDateTime::now_utc();

    let expires_at = now + Duration::days(state.config.session_ttl_days);

    let auth_session_model = auth_sessions::ActiveModel {
        id: NotSet,

        user_id: Set(user.id),

        token_hash: Set(token_hash),

        user_agent: Set(user_agent),
        ip_address: Set(ip_address),

        created_at: NotSet,
        last_seen_at: Set(Some(now)),

        expires_at: Set(expires_at),
        revoked_at: Set(None),
    };

    let _ = auth_sessions::Entity::insert(auth_session_model)
        .exec_with_returning(&state.db)
        .await?;

    let mut active_user: users::ActiveModel = user.clone().into();

    active_user.last_login_at = Set(Some(now));

    active_user.update(&state.db).await?;

    Ok(LoginResult {
        user: user.into(),
        session_token: raw_token,
    })
}

pub async fn resolve_session(
    state: &AppState,
    raw_token: &str,
) -> Result<Option<AuthUser>, AppError> {
    let token_hash = hash_session_token(raw_token);

    let now = OffsetDateTime::now_utc();

    let session = auth_sessions::Entity::find()
        .filter(auth_sessions::Column::TokenHash.eq(token_hash))
        .filter(auth_sessions::Column::RevokedAt.is_null())
        .filter(auth_sessions::Column::ExpiresAt.gt(now))
        .one(&state.db)
        .await?;

    let Some(session) = session else {
        return Ok(None);
    };

    let user = users::Entity::find_by_id(session.user_id)
        .one(&state.db)
        .await?;

    let Some(user) = user else {
        return Ok(None);
    };

    if !user.is_active {
        return Ok(None);
    }

    Ok(Some(user.into()))
}

pub async fn revoke_session(state: &AppState, raw_token: &str) -> Result<(), AppError> {
    let token_hash = hash_session_token(raw_token);

    let session = auth_sessions::Entity::find()
        .filter(auth_sessions::Column::TokenHash.eq(token_hash))
        .one(&state.db)
        .await?;

    let Some(session) = session else {
        return Ok(());
    };

    if session.revoked_at.is_some() {
        return Ok(());
    }

    let mut active: auth_sessions::ActiveModel = session.into();

    active.revoked_at = Set(Some(OffsetDateTime::now_utc()));

    active.update(&state.db).await?;

    Ok(())
}

fn normalize_email(email: &str) -> Result<String, AppError> {
    let email = email.trim().to_lowercase();

    if email.is_empty() || !email.contains('@') {
        return Err(AppError::InvalidCredentials);
    }

    Ok(email)
}
