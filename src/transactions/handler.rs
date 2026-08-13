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
    materialization::{MonthPeriod, prepare_requested_period, virtual_transactions},
    pagination::PageResponse,
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
) -> Result<Json<PageResponse<TransactionResponse>>, AppError> {
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

    let pagination = query.pagination.validate()?;
    let virtual_from = prepare_requested_period(&state, &auth, &start, &end).await?;
    let mut virtual_items =
        virtual_transactions(&state, &auth, &start, &end, &virtual_from).await?;
    if query.overdue {
        virtual_items.clear();
    } else {
        virtual_items.sort_by(|left, right| {
            let ordering = left.due_date.cmp(&right.due_date);
            match query.sort_order {
                crate::transactions::dto::TransactionSortOrder::Asc => ordering,
                crate::transactions::dto::TransactionSortOrder::Desc => ordering.reverse(),
            }
        });
    }
    let transactions = service::list(
        &state,
        &auth,
        Some((&start, &end)),
        pagination,
        virtual_items,
        query.overdue,
        query.sort_order,
    )
    .await?;

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
