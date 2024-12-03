use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct PlanejamentoFinanceiro {
    pub planejamento_id: i32,
    pub usuario_id: i32,
    pub tipo_planejamento: String, // Alterado para String para compatibilidade com MySQL
    pub valor_estimado: Decimal,
    pub data_planejamento: NaiveDate,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum TipoPlanejamento {
    Aposentadoria,
    Investimento,
}

impl TipoPlanejamento {
    pub fn to_string(&self) -> &'static str {
        match self {
            TipoPlanejamento::Aposentadoria => "Aposentadoria",
            TipoPlanejamento::Investimento => "Investimento",
        }
    }
}

impl PlanejamentoFinanceiro {
    pub fn tipo_planejamento_enum(&self) -> Option<TipoPlanejamento> {
        match self.tipo_planejamento.as_str() {
            "Aposentadoria" => Some(TipoPlanejamento::Aposentadoria),
            "Investimento" => Some(TipoPlanejamento::Investimento),
            _ => None,
        }
    }
}
