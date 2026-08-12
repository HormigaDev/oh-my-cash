use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
use sha2::{Digest, Sha256};

use crate::error::AppError;

const SESSION_TOKEN_BYTES: usize = 32;

pub fn generate_session_token() -> Result<String, AppError> {
    let mut bytes = [0_u8; SESSION_TOKEN_BYTES];

    getrandom::fill(&mut bytes).map_err(|error| {
        tracing::error!(?error, "failed to obtain session randomness");

        AppError::Internal
    })?;

    Ok(URL_SAFE_NO_PAD.encode(bytes))
}

pub fn hash_session_token(token: &str) -> Vec<u8> {
    Sha256::digest(token.as_bytes()).to_vec()
}
