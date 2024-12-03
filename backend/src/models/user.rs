use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::NaiveDateTime;

#[derive(Serialize, Deserialize, FromRow)]
pub struct User {
    pub usuario_id: i32,
    pub nome: String,
    pub email: String,
    pub senha_hash: String,
    pub dt_criacao: NaiveDateTime,  // Campo `TIMESTAMP` compatível com `chrono`
}
