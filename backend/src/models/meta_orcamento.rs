use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct MetaOrcamento {
    pub meta_id: i32,
    pub usuario_id: i32,
    pub meta_tipo: String,
    pub valor_meta: Decimal,
    pub valor_atual: Decimal,
    pub data_meta: NaiveDate,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum MetaTipo {
    Orçamento,
    Economia,
}

impl MetaTipo {
    pub fn to_string(&self) -> &'static str {
        match self {
            MetaTipo::Orçamento => "Orçamento",
            MetaTipo::Economia => "Economia",
        }
    }
}

impl MetaOrcamento {
    // Função para converter o campo meta_tipo (String) para o enum MetaTipo
    pub fn meta_tipo_enum(&self) -> Option<MetaTipo> {
        match self.meta_tipo.as_str() {
            "Orçamento" => Some(MetaTipo::Orçamento),
            "Economia" => Some(MetaTipo::Economia),
            _ => None,
        }
    }
}
