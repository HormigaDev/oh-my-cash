use uuid::Uuid;

use crate::entities::users;

#[derive(Clone, Debug)]
pub struct AuthUser {
    pub id: Uuid,
    pub email: String,
    pub display_name: Option<String>,
    pub currency: String,
    pub timezone: String,
    pub locale: String,
}

impl From<users::Model> for AuthUser {
    fn from(user: users::Model) -> Self {
        Self {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
            currency: user.currency,
            timezone: user.timezone,
            locale: user.locale,
        }
    }
}
