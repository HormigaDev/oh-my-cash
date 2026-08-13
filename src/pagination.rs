use serde::{Deserialize, Deserializer, Serialize, de};

use crate::error::AppError;

pub const MAX_PAGE_SIZE: u64 = 100;
const DEFAULT_PAGE_SIZE: u64 = 25;

#[derive(Clone, Copy, Debug, Deserialize)]
pub struct PaginationQuery {
    #[serde(default = "default_page", deserialize_with = "deserialize_u64")]
    pub page: u64,
    #[serde(default = "default_per_page", deserialize_with = "deserialize_u64")]
    pub per_page: u64,
}

impl Default for PaginationQuery {
    fn default() -> Self {
        Self {
            page: default_page(),
            per_page: default_per_page(),
        }
    }
}

impl PaginationQuery {
    pub fn validate(self) -> Result<Self, AppError> {
        if self.page == 0 || self.per_page == 0 || self.per_page > MAX_PAGE_SIZE {
            return Err(AppError::BadRequest(format!(
                "page must be greater than zero and per_page must be between 1 and {MAX_PAGE_SIZE}"
            )));
        }
        Ok(self)
    }

    pub const fn offset(self) -> u64 {
        (self.page - 1) * self.per_page
    }
}

#[derive(Debug, Serialize)]
pub struct PageResponse<T> {
    pub items: Vec<T>,
    pub page: u64,
    pub per_page: u64,
    pub total: u64,
    pub total_pages: u64,
}

impl<T> PageResponse<T> {
    pub fn new(items: Vec<T>, pagination: PaginationQuery, total: u64) -> Self {
        let total_pages = total.div_ceil(pagination.per_page);
        Self {
            items,
            page: pagination.page,
            per_page: pagination.per_page,
            total,
            total_pages,
        }
    }
}

const fn default_page() -> u64 {
    1
}

const fn default_per_page() -> u64 {
    DEFAULT_PAGE_SIZE
}

fn deserialize_u64<'de, D>(deserializer: D) -> Result<u64, D::Error>
where
    D: Deserializer<'de>,
{
    struct U64Visitor;

    impl de::Visitor<'_> for U64Visitor {
        type Value = u64;

        fn expecting(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            formatter.write_str("a positive integer or its string representation")
        }

        fn visit_u64<E>(self, value: u64) -> Result<Self::Value, E> {
            Ok(value)
        }

        fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
        where
            E: de::Error,
        {
            value.parse().map_err(E::custom)
        }

        fn visit_string<E>(self, value: String) -> Result<Self::Value, E>
        where
            E: de::Error,
        {
            self.visit_str(&value)
        }
    }

    deserializer.deserialize_any(U64Visitor)
}
