use sea_orm::{
    ActiveModelTrait, ColumnTrait, DbErr, EntityTrait, NotSet, QueryFilter, QueryOrder, Set, SqlErr,
};

use uuid::Uuid;

use crate::{
    app::AppState,
    auth::AuthUser,
    categories::dto::{CategoryResponse, CreateCategoryRequest, PatchValue, UpdateCategoryRequest},
    entities::categories,
    error::AppError,
};

const CATEGORY_NAME_MAX_LENGTH: usize = 80;

const CATEGORY_ICON_MAX_LENGTH: usize = 80;

const CATEGORY_COLORS: &[&str] = &[
    "teal", "emerald", "cyan", "blue", "indigo", "violet", "amber", "rose",
];

pub async fn list(state: &AppState, auth: &AuthUser) -> Result<Vec<CategoryResponse>, AppError> {
    let models = categories::Entity::find()
        .filter(categories::Column::UserId.eq(auth.id))
        .filter(categories::Column::IsArchived.eq(false))
        .order_by_asc(categories::Column::Name)
        .all(&state.db)
        .await?;

    models.into_iter().map(CategoryResponse::try_from).collect()
}

pub async fn create(
    state: &AppState,
    auth: &AuthUser,
    request: CreateCategoryRequest,
) -> Result<CategoryResponse, AppError> {
    let name = normalize_name(&request.name)?;

    let icon = normalize_icon(request.icon)?;

    let color = normalize_color(request.color)?;

    let model = categories::ActiveModel {
        id: NotSet,

        user_id: Set(auth.id),

        name: Set(name),

        kind: Set(request.kind.as_str().to_owned()),

        icon: Set(icon),

        color: Set(color),

        is_archived: Set(false),

        created_at: NotSet,

        updated_at: NotSet,
    };

    let category = model.insert(&state.db).await.map_err(map_write_error)?;

    category.try_into()
}

pub async fn update(
    state: &AppState,
    auth: &AuthUser,
    category_id: Uuid,
    request: UpdateCategoryRequest,
) -> Result<CategoryResponse, AppError> {
    if !has_updates(&request) {
        return Err(AppError::BadRequest("No fields to update".to_owned()));
    }

    let category = categories::Entity::find()
        .filter(categories::Column::Id.eq(category_id))
        .filter(categories::Column::UserId.eq(auth.id))
        .filter(categories::Column::IsArchived.eq(false))
        .one(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;

    let mut active: categories::ActiveModel = category.into();

    if let Some(name) = request.name {
        active.name = Set(normalize_name(&name)?);
    }

    if let Some(kind) = request.kind {
        active.kind = Set(kind.as_str().to_owned());
    }

    match request.icon {
        PatchValue::Missing => {}

        PatchValue::Null => {
            active.icon = Set(None);
        }

        PatchValue::Value(icon) => {
            active.icon = Set(normalize_icon(Some(icon))?);
        }
    }

    match request.color {
        PatchValue::Missing => {}

        PatchValue::Null => {
            active.color = Set(None);
        }

        PatchValue::Value(color) => {
            active.color = Set(normalize_color(Some(color))?);
        }
    }

    let category = active.update(&state.db).await.map_err(map_write_error)?;

    category.try_into()
}

pub async fn archive(state: &AppState, auth: &AuthUser, category_id: Uuid) -> Result<(), AppError> {
    let category = categories::Entity::find()
        .filter(categories::Column::Id.eq(category_id))
        .filter(categories::Column::UserId.eq(auth.id))
        .one(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;

    if category.is_archived {
        return Ok(());
    }

    let mut active: categories::ActiveModel = category.into();

    active.is_archived = Set(true);

    active.update(&state.db).await?;

    Ok(())
}

fn has_updates(request: &UpdateCategoryRequest) -> bool {
    request.name.is_some()
        || request.kind.is_some()
        || !matches!(request.icon, PatchValue::Missing)
        || !matches!(request.color, PatchValue::Missing)
}

fn normalize_name(value: &str) -> Result<String, AppError> {
    let value = value.trim();

    if value.is_empty() {
        return Err(AppError::BadRequest(
            "Category name cannot be empty".to_owned(),
        ));
    }

    if value.chars().count() > CATEGORY_NAME_MAX_LENGTH {
        return Err(AppError::BadRequest("Category name is too long".to_owned()));
    }

    Ok(value.to_owned())
}

fn normalize_icon(value: Option<String>) -> Result<Option<String>, AppError> {
    let Some(value) = value else {
        return Ok(None);
    };

    let value = value.trim();

    if value.is_empty() {
        return Ok(None);
    }

    if value.chars().count() > CATEGORY_ICON_MAX_LENGTH {
        return Err(AppError::BadRequest("Category icon is too long".to_owned()));
    }

    Ok(Some(value.to_owned()))
}

fn normalize_color(value: Option<String>) -> Result<Option<String>, AppError> {
    let Some(value) = value else {
        return Ok(None);
    };

    let value = value.trim().to_lowercase();

    if value.is_empty() {
        return Ok(None);
    }

    if !CATEGORY_COLORS.contains(&value.as_str()) {
        return Err(AppError::BadRequest("Invalid category color".to_owned()));
    }

    Ok(Some(value))
}

fn map_write_error(error: DbErr) -> AppError {
    if matches!(error.sql_err(), Some(SqlErr::UniqueConstraintViolation(_,))) {
        return AppError::CategoryNameTaken;
    }

    AppError::Database(error)
}
