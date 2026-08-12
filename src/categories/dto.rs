use std::fmt;

use serde::{Deserialize, Deserializer, Serialize};
use uuid::Uuid;

use crate::{entities::categories, error::AppError};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum CategoryKind {
    Expense,
    Income,
    Both,
}

impl CategoryKind {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Expense => "expense",
            Self::Income => "income",
            Self::Both => "both",
        }
    }
}

impl TryFrom<&str> for CategoryKind {
    type Error = AppError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "expense" => Ok(Self::Expense),

            "income" => Ok(Self::Income),

            "both" => Ok(Self::Both),

            _ => Err(AppError::Internal),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub kind: CategoryKind,

    #[serde(default)]
    pub icon: Option<String>,

    #[serde(default)]
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCategoryRequest {
    #[serde(default)]
    pub name: Option<String>,

    #[serde(default)]
    pub kind: Option<CategoryKind>,

    #[serde(default)]
    pub icon: PatchValue<String>,

    #[serde(default)]
    pub color: PatchValue<String>,
}

#[derive(Debug, Default)]
pub enum PatchValue<T> {
    #[default]
    Missing,

    Null,

    Value(T),
}

impl<'de, T> Deserialize<'de> for PatchValue<T>
where
    T: Deserialize<'de>,
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        Option::<T>::deserialize(deserializer).map(|value| match value {
            Some(value) => Self::Value(value),

            None => Self::Null,
        })
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct CategoryResponse {
    pub id: Uuid,
    pub name: String,
    pub kind: CategoryKind,

    pub icon: Option<String>,
    pub color: Option<String>,
}

impl TryFrom<categories::Model> for CategoryResponse {
    type Error = AppError;

    fn try_from(category: categories::Model) -> Result<Self, Self::Error> {
        Ok(Self {
            id: category.id,

            name: category.name,

            kind: CategoryKind::try_from(category.kind.as_str())?,

            icon: category.icon,

            color: category.color,
        })
    }
}

impl fmt::Display for CategoryKind {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(self.as_str())
    }
}
