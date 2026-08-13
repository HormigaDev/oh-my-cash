pub mod period;
pub mod service;

pub use period::MonthPeriod;
pub use service::{
    MaterializationResult, materialize_month, prepare_requested_period, virtual_transactions,
};
