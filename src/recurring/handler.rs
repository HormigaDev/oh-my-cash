use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use uuid::Uuid;

use crate::{
    app::AppState,
    auth::AuthUser,
    error::{AppError, SuccessResponse},
    pagination::PageResponse,
    recurring::{
        dto::{
            CreateRecurringRuleRequest, ListRecurringRulesQuery, RecurringRuleResponse,
            UpdateRecurringRuleRequest,
        },
        service,
    },
};

pub async fn list(
    auth: AuthUser,
    State(state): State<AppState>,
    Query(query): Query<ListRecurringRulesQuery>,
) -> Result<Json<PageResponse<RecurringRuleResponse>>, AppError> {
    let rules = service::list(&state, &auth, query.pagination.validate()?).await?;

    Ok(Json(rules))
}

pub async fn create(
    auth: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<CreateRecurringRuleRequest>,
) -> Result<(StatusCode, Json<RecurringRuleResponse>), AppError> {
    let rule = service::create(&state, &auth, payload).await?;

    Ok((StatusCode::CREATED, Json(rule)))
}

pub async fn update(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(rule_id): Path<Uuid>,
    Json(payload): Json<UpdateRecurringRuleRequest>,
) -> Result<Json<RecurringRuleResponse>, AppError> {
    let rule = service::update(&state, &auth, rule_id, payload).await?;

    Ok(Json(rule))
}

pub async fn deactivate(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(rule_id): Path<Uuid>,
) -> Result<Json<SuccessResponse>, AppError> {
    service::deactivate(&state, &auth, rule_id).await?;

    Ok(Json(SuccessResponse::ok()))
}
