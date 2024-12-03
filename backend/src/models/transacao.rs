use serde::{Deserialize, Serialize};
use sqlx::{FromRow, types::Decimal};  // Use o tipo Decimal do sqlx para compatibilidade
use chrono::NaiveDate;

#[derive(Serialize, Deserialize, FromRow)]
pub struct Transacao {
    pub transacao_id: i32,
    pub usuario_id: i32,
    pub tipo_transacao: String,
    pub categoria: String,
    pub valor: Decimal,  // Usando sqlx::types::Decimal
    pub data_transacao: NaiveDate,
    pub descricao: Option<String>,
}
