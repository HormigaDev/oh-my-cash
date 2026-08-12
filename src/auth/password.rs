use argon2::{
    Argon2,
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
};

use crate::error::AppError;

const PASSWORD_SALT_BYTES: usize = 16;

pub async fn hash_password(password: String) -> Result<String, AppError> {
    validate_password(&password)?;

    tokio::task::spawn_blocking(move || {
        let mut salt_bytes = [0_u8; PASSWORD_SALT_BYTES];

        getrandom::fill(&mut salt_bytes).map_err(|error| {
            tracing::error!(?error, "failed to generate password salt");

            AppError::Internal
        })?;

        let salt = SaltString::encode_b64(&salt_bytes).map_err(|error| {
            tracing::error!(?error, "failed to encode password salt");

            AppError::Internal
        })?;

        Argon2::default()
            .hash_password(password.as_bytes(), &salt)
            .map(|hash| hash.to_string())
            .map_err(|error| {
                tracing::error!(?error, "password hashing failed");

                AppError::Internal
            })
    })
    .await
    .map_err(|error| {
        tracing::error!(?error, "password hashing task failed");

        AppError::Internal
    })?
}

pub async fn verify_password(password: String, encoded_hash: String) -> Result<bool, AppError> {
    tokio::task::spawn_blocking(move || {
        let parsed_hash = PasswordHash::new(&encoded_hash).map_err(|error| {
            tracing::error!(?error, "stored password hash is invalid");

            AppError::Internal
        })?;

        Ok(Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok())
    })
    .await
    .map_err(|error| {
        tracing::error!(?error, "password verification task failed");

        AppError::Internal
    })?
}

fn validate_password(password: &str) -> Result<(), AppError> {
    if password.chars().count() < 12 {
        return Err(AppError::BadRequest(
            "Password must contain at least 12 characters".to_owned(),
        ));
    }

    Ok(())
}
