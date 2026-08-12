use axum::{
    Json,
    extract::{Query, State},
};

use crate::{
    app::AppState,
    auth::AuthUser,
    dashboard::{
        dto::{DashboardQuery, DashboardResponse},
        service,
    },
    error::AppError,
    materialization::MonthPeriod,
};

pub async fn get(
    auth: AuthUser,

    State(state): State<AppState>,

    Query(query): Query<DashboardQuery>,
) -> Result<Json<DashboardResponse>, AppError> {
    let month = query
        .month
        .ok_or_else(|| AppError::BadRequest("month is required".to_owned()))?;

    let period = MonthPeriod::parse(&month)?;

    let dashboard = service::get_dashboard(&state, &auth, &period).await?;

    Ok(Json(dashboard))
}
