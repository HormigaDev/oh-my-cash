use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use time::OffsetDateTime;

use crate::{
    account::dto::{ChangePasswordRequest, UpdateAppearanceRequest, UpdateProfileRequest},
    app::AppState,
    auth::{AuthUser, password},
    entities::{auth_sessions, users},
    error::AppError,
};

const DISPLAY_NAME_MAX_LENGTH: usize = 120;

pub async fn update_profile(
    state: &AppState,
    auth: &AuthUser,
    request: UpdateProfileRequest,
) -> Result<AuthUser, AppError> {
    let email = normalize_email(&request.email)?;
    let display_name = normalize_display_name(request.display_name)?;
    let currency = normalize_currency(&request.currency)?;
    let timezone = normalize_preference(&request.timezone, "timezone", 100)?;
    let locale = normalize_preference(&request.locale, "locale", 35)?;

    let duplicate = users::Entity::find()
        .filter(users::Column::Email.eq(email.clone()))
        .filter(users::Column::Id.ne(auth.id))
        .one(&state.db)
        .await?;
    if duplicate.is_some() {
        return Err(AppError::Conflict("Email is already in use".to_owned()));
    }

    let user = users::Entity::find_by_id(auth.id)
        .one(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;
    let mut active: users::ActiveModel = user.into();
    active.email = Set(email);
    active.display_name = Set(display_name);
    active.currency = Set(currency);
    active.timezone = Set(timezone);
    active.locale = Set(locale);

    Ok(active.update(&state.db).await?.into())
}

pub async fn update_appearance(
    state: &AppState,
    auth: &AuthUser,
    request: UpdateAppearanceRequest,
) -> Result<AuthUser, AppError> {
    const THEMES: &[&str] = &[
        "aurora", "ocean", "royal", "orchid", "rose", "sunset", "forest",
        "graphite", "coral", "nord", "contrast-light", "contrast-dark",
    ];
    const MODES: &[&str] = &["system", "light", "dark"];
    if !THEMES.contains(&request.theme.as_str()) || !MODES.contains(&request.theme_mode.as_str()) {
        return Err(AppError::BadRequest("Invalid appearance preference".to_owned()));
    }

    let user = users::Entity::find_by_id(auth.id)
        .one(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;
    let mut active: users::ActiveModel = user.into();
    active.theme = Set(request.theme);
    active.theme_mode = Set(request.theme_mode);
    Ok(active.update(&state.db).await?.into())
}

pub async fn change_password(
    state: &AppState,
    auth: &AuthUser,
    request: ChangePasswordRequest,
) -> Result<AuthUser, AppError> {
    let user = users::Entity::find_by_id(auth.id)
        .one(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;

    if !password::verify_password(request.current_password, user.password_hash.clone()).await? {
        return Err(AppError::InvalidCredentials);
    }

    let password_hash = password::hash_password(request.new_password).await?;
    let now = OffsetDateTime::now_utc();
    let mut active: users::ActiveModel = user.into();
    active.password_hash = Set(password_hash);
    active.password_changed_at = Set(Some(now));
    let updated = active.update(&state.db).await?;

    auth_sessions::Entity::update_many()
        .col_expr(auth_sessions::Column::RevokedAt, sea_orm::sea_query::Expr::value(now))
        .filter(auth_sessions::Column::UserId.eq(auth.id))
        .filter(auth_sessions::Column::RevokedAt.is_null())
        .exec(&state.db)
        .await?;

    Ok(updated.into())
}

fn normalize_email(value: &str) -> Result<String, AppError> {
    let value = value.trim().to_lowercase();
    if value.is_empty() || value.len() > 254 || !value.contains('@') {
        return Err(AppError::BadRequest("Invalid email".to_owned()));
    }
    Ok(value)
}

fn normalize_display_name(value: Option<String>) -> Result<Option<String>, AppError> {
    let Some(value) = value else { return Ok(None) };
    let value = value.trim();
    if value.is_empty() { return Ok(None) }
    if value.chars().count() > DISPLAY_NAME_MAX_LENGTH {
        return Err(AppError::BadRequest("Display name is too long".to_owned()));
    }
    Ok(Some(value.to_owned()))
}

fn normalize_currency(value: &str) -> Result<String, AppError> {
    let value = value.trim().to_uppercase();
    if value.len() != 3 || !value.chars().all(|char| char.is_ascii_uppercase()) {
        return Err(AppError::BadRequest("Currency must use an ISO 4217 code".to_owned()));
    }
    Ok(value)
}

fn normalize_preference(value: &str, field: &str, max: usize) -> Result<String, AppError> {
    let value = value.trim();
    if value.is_empty() || value.len() > max {
        return Err(AppError::BadRequest(format!("Invalid {field}")));
    }
    Ok(value.to_owned())
}
