use time::{Date, Month};

use crate::error::AppError;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct MonthPeriod {
    year: i32,
    month: Month,
    key: String,
    first_day: Date,
    last_day: Date,
}

impl MonthPeriod {
    pub fn parse(value: &str) -> Result<Self, AppError> {
        let (year, month) = value.split_once('-').ok_or_else(|| invalid_month())?;

        if year.len() != 4
            || month.len() != 2
            || !year.chars().all(|char| char.is_ascii_digit())
            || !month.chars().all(|char| char.is_ascii_digit())
        {
            return Err(invalid_month());
        }

        let year = year.parse::<i32>().map_err(|_| invalid_month())?;

        let month_number = month.parse::<u8>().map_err(|_| invalid_month())?;

        let month = Month::try_from(month_number).map_err(|_| invalid_month())?;

        let first_day = Date::from_calendar_date(year, month, 1).map_err(|_| invalid_month())?;

        let last_day = Date::from_calendar_date(year, month, month.length(year))
            .map_err(|_| AppError::Internal)?;

        Ok(Self {
            year,
            month,
            key: value.to_owned(),
            first_day,
            last_day,
        })
    }

    pub const fn first_day(&self) -> Date {
        self.first_day
    }

    pub const fn last_day(&self) -> Date {
        self.last_day
    }

    pub fn key(&self) -> &str {
        &self.key
    }

    pub fn due_date(&self, day_of_month: u8) -> Result<Date, AppError> {
        if !(1..=31).contains(&day_of_month) {
            return Err(AppError::Internal);
        }

        let actual_day = day_of_month.min(self.month.length(self.year));

        Date::from_calendar_date(self.year, self.month, actual_day).map_err(|_| AppError::Internal)
    }

    pub fn next(&self) -> Result<Self, AppError> {
        let (year, month) = if self.month == Month::December {
            (self.year + 1, Month::January)
        } else {
            (
                self.year,
                Month::try_from(u8::from(self.month) + 1).map_err(|_| AppError::Internal)?,
            )
        };

        Self::parse(&format!("{year:04}-{:02}", u8::from(month)))
    }
}

fn invalid_month() -> AppError {
    AppError::BadRequest("month must use YYYY-MM".to_owned())
}

// Tests

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_month() {
        let period = MonthPeriod::parse("2026-08").unwrap();

        assert_eq!(
            period.first_day(),
            Date::from_calendar_date(2026, Month::August, 1,).unwrap(),
        );
    }

    #[test]
    fn rejects_invalid_month() {
        assert!(MonthPeriod::parse("2026-13",).is_err(),);

        assert!(MonthPeriod::parse("2026-8",).is_err(),);

        assert!(MonthPeriod::parse("hello",).is_err(),);
    }

    #[test]
    fn day_31_falls_back_in_february() {
        let period = MonthPeriod::parse("2026-02").unwrap();

        assert_eq!(
            period.due_date(31).unwrap(),
            Date::from_calendar_date(2026, Month::February, 28,).unwrap(),
        );
    }

    #[test]
    fn day_31_respects_leap_year() {
        let period = MonthPeriod::parse("2028-02").unwrap();

        assert_eq!(
            period.due_date(31).unwrap(),
            Date::from_calendar_date(2028, Month::February, 29,).unwrap(),
        );
    }

    #[test]
    fn day_31_falls_back_in_april() {
        let period = MonthPeriod::parse("2026-04").unwrap();

        assert_eq!(
            period.due_date(31).unwrap(),
            Date::from_calendar_date(2026, Month::April, 30,).unwrap(),
        );
    }

    #[test]
    fn valid_day_is_preserved() {
        let period = MonthPeriod::parse("2026-08").unwrap();

        assert_eq!(
            period.due_date(10).unwrap(),
            Date::from_calendar_date(2026, Month::August, 10,).unwrap(),
        );
    }
}
