use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "categories")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,

    pub user_id: Uuid,

    pub name: String,
    pub kind: String,

    pub icon: Option<String>,
    pub color: Option<String>,

    pub is_archived: bool,

    pub created_at: TimeDateTimeWithTimeZone,

    pub updated_at: TimeDateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
