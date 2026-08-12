use std::{env, net::SocketAddr};

use anyhow::{Context, Result, bail};

#[derive(Clone, Debug)]
pub struct Config {
    pub environment: Environment,
    pub bind_addr: SocketAddr,

    pub database_url: String,

    pub session_cookie_name: String,
    pub session_ttl_days: i64,
    pub session_cookie_secure: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Environment {
    Development,
    Production,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        let environment = match env_var("APP_ENV")
            .unwrap_or_else(|_| "development".to_owned())
            .as_str()
        {
            "development" => Environment::Development,
            "production" => Environment::Production,
            other => bail!("unsupported APP_ENV: {other}"),
        };

        let bind_addr = env_var("APP_BIND")
            .unwrap_or_else(|_| "127.0.0.1:8383".to_owned())
            .parse()
            .context("APP_BIND must be a valid socket addres")?;

        let database_url = env_var("DATABASE_URL").context("DATABASE_URL is required")?;

        let session_cookie_name =
            env_var("SESSION_COOKIE_NAME").unwrap_or_else(|_| "omc_session".to_owned());

        let session_ttl_days = env_var("SESSION_TTL_DAYS")
            .unwrap_or_else(|_| "30".to_owned())
            .parse::<i64>()
            .context("SESSION_TTL_DAYS must be an integer")?;

        if session_ttl_days <= 0 {
            bail!("SESSION_TTL_DAYS must be greater than zero");
        }

        let session_cookie_secure = env_var("SESSION_COOKIE_SECURE")
            .unwrap_or_else(|_| {
                if environment == Environment::Production {
                    "true".to_owned()
                } else {
                    "false".to_owned()
                }
            })
            .parse::<bool>()
            .context("SESSION_COOKIE_SECURE must be true or false")?;

        if environment == Environment::Production && !session_cookie_secure {
            bail!("SESSION_COOKIE_SECURE must be true in production");
        }

        Ok(Self {
            environment,
            bind_addr,
            database_url,
            session_cookie_name,
            session_ttl_days,
            session_cookie_secure,
        })
    }
}

fn env_var(name: &str) -> Result<String, env::VarError> {
    env::var(name)
}
