use axum::{extract::FromRequestParts, http::request::Parts};
use tower_cookies::Cookies;

use crate::{
    app::AppState,
    auth::{AuthUser, service},
    error::AppError,
};

impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let cookies = Cookies::from_request_parts(parts, state)
            .await
            .map_err(|_| AppError::Internal)?;

        let cookie = cookies
            .get(&state.config.session_cookie_name)
            .ok_or(AppError::Unauthorized)?;

        service::resolve_session(state, cookie.value())
            .await?
            .ok_or(AppError::Unauthorized)
    }
}
