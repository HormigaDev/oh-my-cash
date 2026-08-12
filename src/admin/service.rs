use sea_orm::{
    ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, QueryOrder, Set,
};
use time::{
    OffsetDateTime,
    format_description::well_known::Rfc3339,
};
use uuid::Uuid;

use crate::{
    admin::dto::{CreateUserRequest, DeleteUserRequest, ManagedUserResponse, UpdateUserRequest},
    app::AppState,
    auth::{AuthUser, password},
    entities::{auth_sessions, users},
    error::AppError,
};

const DISPLAY_NAME_MAX_LENGTH: usize = 120;

pub async fn list(
    state: &AppState,
    auth: &AuthUser,
) -> Result<Vec<ManagedUserResponse>, AppError> {
    ensure_admin(state, auth, None).await?;
    users::Entity::find()
        .order_by_asc(users::Column::Email)
        .all(&state.db)
        .await?
        .into_iter()
        .map(response)
        .collect()
}

pub async fn create(
    state: &AppState,
    auth: &AuthUser,
    request: CreateUserRequest,
) -> Result<ManagedUserResponse, AppError> {
    ensure_admin(state, auth, Some(request.administrator_password)).await?;
    let email = normalize_email(&request.email)?;
    let display_name = normalize_display_name(request.display_name)?;

    if users::Entity::find()
        .filter(users::Column::Email.eq(email.clone()))
        .one(&state.db)
        .await?
        .is_some()
    {
        return Err(AppError::Conflict("Email is already in use".to_owned()));
    }

    let password_hash = password::hash_password(request.password).await?;
    let now = OffsetDateTime::now_utc();
    let user = users::ActiveModel {
        id: sea_orm::ActiveValue::NotSet,
        email: Set(email),
        password_hash: Set(password_hash),
        display_name: Set(display_name),
        currency: Set("BRL".to_owned()),
        timezone: Set("America/Sao_Paulo".to_owned()),
        locale: Set("es-ES".to_owned()),
        theme: Set("aurora".to_owned()),
        theme_mode: Set("system".to_owned()),
        role: Set("user".to_owned()),
        is_active: Set(true),
        password_changed_at: Set(Some(now)),
        last_login_at: Set(None),
        created_at: sea_orm::ActiveValue::NotSet,
        updated_at: sea_orm::ActiveValue::NotSet,
    }
    .insert(&state.db)
    .await?;

    response(user)
}

pub async fn update(
    state: &AppState,
    auth: &AuthUser,
    user_id: Uuid,
    request: UpdateUserRequest,
) -> Result<ManagedUserResponse, AppError> {
    ensure_admin(state, auth, Some(request.administrator_password)).await?;
    let email = normalize_email(&request.email)?;
    let display_name = normalize_display_name(request.display_name)?;

    if users::Entity::find()
        .filter(users::Column::Email.eq(email.clone()))
        .filter(users::Column::Id.ne(user_id))
        .one(&state.db)
        .await?
        .is_some()
    {
        return Err(AppError::Conflict("Email is already in use".to_owned()));
    }

    let user = users::Entity::find_by_id(user_id)
        .one(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;
    let mut active: users::ActiveModel = user.into();
    active.email = Set(email);
    active.display_name = Set(display_name);

    let new_password = request.new_password.filter(|value| !value.is_empty());
    let password_changed = new_password.is_some();
    if let Some(new_password) = new_password {
        active.password_hash = Set(password::hash_password(new_password).await?);
        active.password_changed_at = Set(Some(OffsetDateTime::now_utc()));
    }

    let updated = active.update(&state.db).await?;

    if password_changed {
        revoke_sessions(state, updated.id).await?;
    }

    response(updated)
}

pub async fn remove(
    state: &AppState,
    auth: &AuthUser,
    user_id: Uuid,
    request: DeleteUserRequest,
) -> Result<(), AppError> {
    ensure_admin(state, auth, Some(request.administrator_password)).await?;
    if user_id == auth.id {
        return Err(AppError::BadRequest("An administrator cannot delete their own account".to_owned()));
    }

    let user = users::Entity::find_by_id(user_id)
        .one(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;
    users::Entity::delete_by_id(user.id).exec(&state.db).await?;
    Ok(())
}

async fn ensure_admin(
    state: &AppState,
    auth: &AuthUser,
    administrator_password: Option<String>,
) -> Result<(), AppError> {
    if auth.role != "admin" {
        return Err(AppError::Unauthorized);
    }

    let Some(administrator_password) = administrator_password else {
        return Ok(());
    };
    let user = users::Entity::find_by_id(auth.id)
        .one(&state.db)
        .await?
        .ok_or(AppError::Unauthorized)?;
    if user.role != "admin"
        || !password::verify_password(administrator_password, user.password_hash).await?
    {
        return Err(AppError::InvalidCredentials);
    }
    Ok(())
}

async fn revoke_sessions(state: &AppState, user_id: Uuid) -> Result<(), AppError> {
    auth_sessions::Entity::update_many()
        .col_expr(
            auth_sessions::Column::RevokedAt,
            sea_orm::sea_query::Expr::value(OffsetDateTime::now_utc()),
        )
        .filter(auth_sessions::Column::UserId.eq(user_id))
        .filter(auth_sessions::Column::RevokedAt.is_null())
        .exec(&state.db)
        .await?;
    Ok(())
}

fn response(user: users::Model) -> Result<ManagedUserResponse, AppError> {
    Ok(ManagedUserResponse {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        created_at: user
            .created_at
            .format(&Rfc3339)
            .map_err(|_| AppError::Internal)?,
    })
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
