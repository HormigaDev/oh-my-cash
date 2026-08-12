use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "auth_sessions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,

    pub user_id: Uuid,

    pub token_hash: Vec<u8>,

    pub user_agent: Option<String>,
    pub ip_address: Option<String>,

    pub created_at: TimeDateTimeWithTimeZone,

    pub last_seen_at: Option<TimeDateTimeWithTimeZone>,

    pub expires_at: TimeDateTimeWithTimeZone,

    pub revoked_at: Option<TimeDateTimeWithTimeZone>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
