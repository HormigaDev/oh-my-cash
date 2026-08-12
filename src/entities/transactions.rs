use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "transactions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,

    pub user_id: Uuid,
    pub category_id: Uuid,

    pub recurring_rule_id: Option<Uuid>,

    pub client_operation_id: Option<Uuid>,

    pub direction: String,
    pub status: String,

    pub description: String,
    pub notes: Option<String>,

    pub expected_amount: Option<Decimal>,

    pub actual_amount: Option<Decimal>,

    pub due_date: Option<TimeDate>,

    pub recurrence_period: Option<TimeDate>,

    pub occurred_at: Option<TimeDateTimeWithTimeZone>,

    pub paid_at: Option<TimeDateTimeWithTimeZone>,

    pub created_at: TimeDateTimeWithTimeZone,

    pub updated_at: TimeDateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
