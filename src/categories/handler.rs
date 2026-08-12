use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use uuid::Uuid;

use crate::{
    app::AppState,
    auth::AuthUser,
    categories::{
        dto::{CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest},
        service,
    },
    error::AppError,
};

pub async fn list(
    auth: AuthUser,
    State(state): State<AppState>,
) -> Result<Json<Vec<CategoryResponse>>, AppError> {
    let categories = service::list(&state, &auth).await?;

    Ok(Json(categories))
}

pub async fn create(
    auth: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<CreateCategoryRequest>,
) -> Result<(StatusCode, Json<CategoryResponse>), AppError> {
    let category = service::create(&state, &auth, payload).await?;

    Ok((StatusCode::CREATED, Json(category)))
}

pub async fn update(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(category_id): Path<Uuid>,
    Json(payload): Json<UpdateCategoryRequest>,
) -> Result<Json<CategoryResponse>, AppError> {
    let category = service::update(&state, &auth, category_id, payload).await?;

    Ok(Json(category))
}

pub async fn archive(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(category_id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    service::archive(&state, &auth, category_id).await?;

    Ok(StatusCode::NO_CONTENT)
}
