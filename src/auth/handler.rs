use axum::{Json, extract::State, http::HeaderMap};
use tower_cookies::{
    Cookie, Cookies,
    cookie::{SameSite, time::Duration as CookieDuration},
};

use crate::{
    app::AppState,
    auth::{
        AuthUser,
        dto::{AuthUserResponse, LoginRequest, SessionResponse},
        service,
    },
    config::Config,
    error::AppError,
};

pub async fn login(
    State(state): State<AppState>,
    cookies: Cookies,
    headers: HeaderMap,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<SessionResponse>, AppError> {
    let user_agent = headers
        .get("user-agent")
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned);

    // Until we configure trusted proxy handling,
    // do not blindly trust X-Forwarded-For here.
    let ip_address = None;

    let result = service::login(&state, payload, user_agent, ip_address).await?;

    cookies.add(build_session_cookie(&state.config, result.session_token));

    Ok(Json(SessionResponse {
        user: Some(result.user.into()),
    }))
}

pub async fn current_session(
    State(state): State<AppState>,
    cookies: Cookies,
) -> Result<Json<SessionResponse>, AppError> {
    let Some(cookie) = cookies.get(&state.config.session_cookie_name) else {
        return Ok(Json(SessionResponse { user: None }));
    };

    let user = service::resolve_session(&state, cookie.value()).await?;

    Ok(Json(SessionResponse {
        user: user.map(Into::into),
    }))
}

pub async fn logout(
    State(state): State<AppState>,
    cookies: Cookies,
) -> Result<Json<SessionResponse>, AppError> {
    if let Some(cookie) = cookies.get(&state.config.session_cookie_name) {
        service::revoke_session(&state, cookie.value()).await?;
    }

    cookies.remove(removal_cookie(&state.config));

    Ok(Json(SessionResponse { user: None }))
}

fn build_session_cookie(config: &Config, token: String) -> Cookie<'static> {
    Cookie::build((config.session_cookie_name.clone(), token))
        .http_only(true)
        .secure(config.session_cookie_secure)
        .same_site(SameSite::Lax)
        .path("/")
        .max_age(CookieDuration::days(config.session_ttl_days))
        .build()
}

fn removal_cookie(config: &Config) -> Cookie<'static> {
    Cookie::build((config.session_cookie_name.clone(), String::new()))
        .http_only(true)
        .secure(config.session_cookie_secure)
        .same_site(SameSite::Lax)
        .path("/")
        .max_age(CookieDuration::seconds(0))
        .build()
}

pub async fn authenticated_test(auth: AuthUser) -> Json<AuthUserResponse> {
    Json(auth.into())
}
