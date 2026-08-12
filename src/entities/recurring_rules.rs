use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "recurring_rules")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,

    pub user_id: Uuid,
    pub category_id: Uuid,

    pub name: String,

    pub direction: String,
    pub amount_mode: String,

    pub fixed_amount: Option<Decimal>,
    pub estimated_amount: Option<Decimal>,
    pub min_amount: Option<Decimal>,
    pub max_amount: Option<Decimal>,

    pub frequency: String,

    pub day_of_month: i16,

    pub starts_on: TimeDate,
    pub ends_on: Option<TimeDate>,

    pub is_active: bool,

    pub notes: Option<String>,

    pub created_at: TimeDateTimeWithTimeZone,

    pub updated_at: TimeDateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
