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
    let period = query.month.as_deref().map(MonthPeriod::parse).transpose()?;

    if let Some(period) = period.as_ref() {
        materialize_month(&state, &auth, period).await?;
    }

    let transactions = service::list(&state, &auth, period.as_ref()).await?;

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
