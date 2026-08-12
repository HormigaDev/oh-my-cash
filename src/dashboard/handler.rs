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
    let (start, end) = match (query.start_month, query.end_month, query.month) {
        (Some(start), Some(end), _) => (MonthPeriod::parse(&start)?, MonthPeriod::parse(&end)?),
        (None, None, Some(month)) => {
            let period = MonthPeriod::parse(&month)?;
            (period.clone(), period)
        }
        _ => {
            return Err(AppError::BadRequest(
                "start_month and end_month are required".to_owned(),
            ));
        }
    };

    if start.first_day() > end.first_day() {
        return Err(AppError::BadRequest(
            "start_month cannot be after end_month".to_owned(),
        ));
    }

    let dashboard = service::get_dashboard(&state, &auth, &start, &end).await?;

    Ok(Json(dashboard))
}
