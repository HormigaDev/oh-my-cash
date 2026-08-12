use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use uuid::Uuid;

use crate::{
    app::AppState,
    auth::AuthUser,
    error::AppError,
    materialization::{MonthPeriod, materialize_month},
    transactions::{
        dto::{
            CreateTransactionRequest, ListTransactionsQuery, PayTransactionRequest,
            TransactionResponse, UpdateTransactionRequest,
        },
        service,
    },
};

pub async fn list(
    auth: AuthUser,

    State(state): State<AppState>,

    Query(query): Query<ListTransactionsQuery>,
) -> Result<Json<Vec<TransactionResponse>>, AppError> {
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

    let mut period = start.clone();
    loop {
        materialize_month(&state, &auth, &period).await?;
        if period == end {
            break;
        }
        period = period.next()?;
    }

    let transactions = service::list(&state, &auth, Some((&start, &end))).await?;

    Ok(Json(transactions))
}

pub async fn create(
    auth: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<CreateTransactionRequest>,
) -> Result<(StatusCode, Json<TransactionResponse>), AppError> {
    let result = service::create(&state, &auth, payload).await?;

    let status = if result.created {
        StatusCode::CREATED
    } else {
        StatusCode::OK
    };

    Ok((status, Json(result.transaction)))
}

pub async fn update(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(transaction_id): Path<Uuid>,
    Json(payload): Json<UpdateTransactionRequest>,
) -> Result<Json<TransactionResponse>, AppError> {
    let transaction = service::update(&state, &auth, transaction_id, payload).await?;

    Ok(Json(transaction))
}

pub async fn pay(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(transaction_id): Path<Uuid>,
    Json(payload): Json<PayTransactionRequest>,
) -> Result<Json<TransactionResponse>, AppError> {
    let transaction = service::pay(&state, &auth, transaction_id, payload).await?;

    Ok(Json(transaction))
}

pub async fn skip(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(transaction_id): Path<Uuid>,
) -> Result<Json<TransactionResponse>, AppError> {
    let transaction = service::skip(&state, &auth, transaction_id).await?;

    Ok(Json(transaction))
}

pub async fn cancel(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(transaction_id): Path<Uuid>,
) -> Result<Json<TransactionResponse>, AppError> {
    let transaction = service::cancel(&state, &auth, transaction_id).await?;

    Ok(Json(transaction))
}
