use axum::{
    Json,
    extract::{Path, Query, State},
};
use uuid::Uuid;

use crate::{
    admin::{
        dto::{
            CreateUserRequest, DeleteUserRequest, ListUsersQuery, ManagedUserResponse,
            UpdateUserRequest,
        },
        service,
    },
    app::AppState,
    auth::AuthUser,
    error::{AppError, SuccessResponse},
    pagination::PageResponse,
};

pub async fn list(
    auth: AuthUser,
    State(state): State<AppState>,
    Query(query): Query<ListUsersQuery>,
) -> Result<Json<PageResponse<ManagedUserResponse>>, AppError> {
    Ok(Json(
        service::list(&state, &auth, query.pagination.validate()?).await?,
    ))
}

pub async fn create(
    auth: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<Json<ManagedUserResponse>, AppError> {
    Ok(Json(service::create(&state, &auth, payload).await?))
}

pub async fn update(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
    Json(payload): Json<UpdateUserRequest>,
) -> Result<Json<ManagedUserResponse>, AppError> {
    Ok(Json(
        service::update(&state, &auth, user_id, payload).await?,
    ))
}

pub async fn remove(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
    Json(payload): Json<DeleteUserRequest>,
) -> Result<Json<SuccessResponse>, AppError> {
    service::remove(&state, &auth, user_id, payload).await?;
    Ok(Json(SuccessResponse::ok()))
}
