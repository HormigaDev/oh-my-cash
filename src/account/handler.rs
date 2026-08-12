use axum::{Json, extract::State};

use crate::{
    account::{
        dto::{ChangePasswordRequest, UpdateAppearanceRequest, UpdateProfileRequest},
        service,
    },
    app::AppState,
    auth::{AuthUser, dto::AuthUserResponse},
    error::AppError,
};

pub async fn update_profile(
    auth: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<UpdateProfileRequest>,
) -> Result<Json<AuthUserResponse>, AppError> {
    Ok(Json(
        service::update_profile(&state, &auth, payload)
            .await?
            .into(),
    ))
}

pub async fn update_appearance(
    auth: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<UpdateAppearanceRequest>,
) -> Result<Json<AuthUserResponse>, AppError> {
    Ok(Json(
        service::update_appearance(&state, &auth, payload)
            .await?
            .into(),
    ))
}

pub async fn change_password(
    auth: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<ChangePasswordRequest>,
) -> Result<Json<AuthUserResponse>, AppError> {
    Ok(Json(
        service::change_password(&state, &auth, payload)
            .await?
            .into(),
    ))
}
