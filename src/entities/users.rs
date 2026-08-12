use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "users")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,

    pub email: String,
    pub password_hash: String,

    pub display_name: Option<String>,

    pub currency: String,
    pub timezone: String,
    pub locale: String,
    pub theme: String,
    pub theme_mode: String,
    pub role: String,

    pub is_active: bool,

    pub password_changed_at: Option<TimeDateTimeWithTimeZone>,

    pub last_login_at: Option<TimeDateTimeWithTimeZone>,

    pub created_at: TimeDateTimeWithTimeZone,
    pub updated_at: TimeDateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
