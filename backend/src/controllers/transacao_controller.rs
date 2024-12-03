use actix_web::{get, post, put, delete, web, HttpResponse, Responder};
use sqlx::MySqlPool;
use crate::models::transacao::Transacao;
use chrono::NaiveDate;
use serde::{Deserialize, Deserializer};
use rust_decimal::Decimal;
use std::fmt;

#[get("/transacoes")]
async fn get_transacoes(db_pool: web::Data<MySqlPool>) -> impl Responder {
    let result = sqlx::query_as::<_, Transacao>("SELECT * FROM transacoes")
        .fetch_all(db_pool.get_ref())
        .await;

    match result {
        Ok(transacoes) => HttpResponse::Ok().json(transacoes),
        Err(e) => {
            println!("Erro ao buscar transações: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao buscar transações")
        }
    }
}

#[derive(Deserialize)]
struct NewTransacao {
    usuario_id: i32,
    #[serde(rename = "tipo_transacao")]
    tipo_transacao: TipoTransacao,
    categoria: String,
    valor: Decimal,
    data_transacao: NaiveDate,
    descricao: Option<String>,
}

#[derive(Debug)]
enum TipoTransacao {
    Despesa,
    Receita,
    Salario,
}

impl fmt::Display for TipoTransacao {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TipoTransacao::Despesa => write!(f, "Despesa"),
            TipoTransacao::Receita => write!(f, "Receita"),
            TipoTransacao::Salario => write!(f, "Salário"),
        }
    }
}

// Implementação personalizada para desserializar `TipoTransacao` e tratar erros.
impl<'de> Deserialize<'de> for TipoTransacao {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?.to_lowercase();
        match s.as_str() {
            "despesa" => Ok(TipoTransacao::Despesa),
            "receita" => Ok(TipoTransacao::Receita),
            "salário" => Ok(TipoTransacao::Salario),
            _ => Err(serde::de::Error::custom("O campo 'tipo_transacao' deve ser 'despesa','receita' Ou 'Salario'.")),
        }
    }
}

#[post("/transacoes")]
async fn create_transacao(db_pool: web::Data<MySqlPool>, new_transacao: web::Json<NewTransacao>) -> impl Responder {
    let result = sqlx::query(
        "INSERT INTO transacoes (usuario_id, tipo_transacao, categoria, valor, data_transacao, descricao) VALUES (?, ?, ?, ?, ?, ?)"
    )
        .bind(new_transacao.usuario_id)
        .bind(new_transacao.tipo_transacao.to_string()) // Usa o enum TipoTransacao para garantir valores válidos
        .bind(&new_transacao.categoria)
        .bind(new_transacao.valor)
        .bind(new_transacao.data_transacao)
        .bind(&new_transacao.descricao)
        .execute(db_pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Created().body("Transação criada com sucesso"),
        Err(e) => {
            println!("Erro ao criar transação: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao criar transação")
        }
    }
}

#[derive(Deserialize)]
struct UpdateTransacao {
    tipo_transacao: Option<TipoTransacao>,
    categoria: Option<String>,
    valor: Option<Decimal>,
    data_transacao: Option<NaiveDate>,
    descricao: Option<String>,
}

#[put("/transacoes/{transacao_id}")]
async fn update_transacao(
    db_pool: web::Data<MySqlPool>,
    transacao_id: web::Path<i32>,
    updated_transacao: web::Json<UpdateTransacao>,
) -> impl Responder {
    let mut query = "UPDATE transacoes SET".to_string();
    let mut query_builder = sqlx::query("");

    if let Some(tipo) = &updated_transacao.tipo_transacao {
        query.push_str(" tipo_transacao = ?,");
        query_builder = query_builder.bind(tipo.to_string());
    }
    if let Some(categoria) = &updated_transacao.categoria {
        query.push_str(" categoria = ?,");
        query_builder = query_builder.bind(categoria);
    }
    if let Some(valor) = updated_transacao.valor {
        query.push_str(" valor = ?,");
        query_builder = query_builder.bind(valor);
    }
    if let Some(data_transacao) = updated_transacao.data_transacao {
        query.push_str(" data_transacao = ?,");
        query_builder = query_builder.bind(data_transacao);
    }
    if let Some(descricao) = &updated_transacao.descricao {
        query.push_str(" descricao = ?,");
        query_builder = query_builder.bind(descricao);
    }

    query.pop(); // Remove a última vírgula
    query.push_str(" WHERE transacao_id = ?");

    let query_builder = sqlx::query(&query)
        .bind(*transacao_id);

    let result = query_builder.execute(db_pool.get_ref()).await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Transação atualizada com sucesso"),
        Err(e) => {
            println!("Erro ao atualizar transação: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao atualizar transação")
        }
    }
}

#[delete("/transacoes/{transacao_id}")]
async fn delete_transacao(db_pool: web::Data<MySqlPool>, transacao_id: web::Path<i32>) -> impl Responder {
    let result = sqlx::query("DELETE FROM transacoes WHERE transacao_id = ?")
        .bind(*transacao_id)
        .execute(db_pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Transação deletada com sucesso"),
        Err(e) => {
            println!("Erro ao deletar transação: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao deletar transação")
        }
    }
}

#[delete("/transacoes")]
async fn delete_all_transacoes(db_pool: web::Data<MySqlPool>) -> impl Responder {
    let result = sqlx::query("DELETE FROM transacoes")
        .execute(db_pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Todas as transações foram deletadas"),
        Err(e) => {
            println!("Erro ao deletar todas as transações: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao deletar todas as transações")
        }
    }
}

#[get("/transacoes/{usuario_id}")]
async fn get_transacoes_by_user(db_pool: web::Data<MySqlPool>, usuario_id: web::Path<i32>) -> impl Responder {
    let result = sqlx::query_as::<_, Transacao>("SELECT * FROM transacoes WHERE usuario_id = ?")
        .bind(*usuario_id)
        .fetch_all(db_pool.get_ref())
        .await;

    match result {
        Ok(transacoes) => HttpResponse::Ok().json(transacoes),
        Err(e) => {
            println!("Erro ao buscar transações do usuário: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao buscar transações do usuário")
        }
    }
}



