use actix_web::{get, post, put, delete, web, HttpResponse, Responder};
use sqlx::MySqlPool;
use chrono::NaiveDate;
use serde::Deserialize;
use rust_decimal::Decimal;

use crate::models::planejamento_financeiro::{PlanejamentoFinanceiro, TipoPlanejamento};

#[derive(Deserialize)]
pub struct NewPlanejamentoFinanceiro {
    pub usuario_id: i32,
    pub tipo_planejamento: TipoPlanejamento,
    pub valor_estimado: Decimal,
    pub data_planejamento: NaiveDate,
}

#[get("/planejamento_financeiro")]
async fn get_planejamentos(db_pool: web::Data<MySqlPool>) -> impl Responder {
    let result = sqlx::query_as::<_, PlanejamentoFinanceiro>("SELECT * FROM planejamento_financeiro")
        .fetch_all(db_pool.get_ref())
        .await;

    match result {
        Ok(planejamentos) => HttpResponse::Ok().json(planejamentos),
        Err(e) => {
            println!("Erro ao buscar planejamentos: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao buscar planejamentos")
        }
    }
}

#[post("/planejamento_financeiro")]
async fn create_planejamento(
    db_pool: web::Data<MySqlPool>,
    new_planejamento: web::Json<NewPlanejamentoFinanceiro>,
) -> impl Responder {
    let result = sqlx::query(
        "INSERT INTO planejamento_financeiro (usuario_id, tipo_planejamento, valor_estimado, data_planejamento) VALUES (?, ?, ?, ?)"
    )
        .bind(new_planejamento.usuario_id)
        .bind(new_planejamento.tipo_planejamento.to_string()) // Converte TipoPlanejamento para String
        .bind(new_planejamento.valor_estimado)
        .bind(new_planejamento.data_planejamento)
        .execute(db_pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Created().body("Planejamento criado com sucesso"),
        Err(e) => {
            println!("Erro ao criar planejamento: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao criar planejamento")
        }
    }
}

#[derive(Deserialize)]
struct UpdatePlanejamentoFinanceiro {
    pub tipo_planejamento: Option<TipoPlanejamento>,
    pub valor_estimado: Option<Decimal>,
    pub data_planejamento: Option<NaiveDate>,
}

#[put("/planejamento_financeiro/{planejamento_id}")]
async fn update_planejamento(
    db_pool: web::Data<MySqlPool>,
    planejamento_id: web::Path<i32>,
    updated_planejamento: web::Json<UpdatePlanejamentoFinanceiro>,
) -> impl Responder {
    let mut query = "UPDATE planejamento_financeiro SET".to_string();
    let mut query_builder = sqlx::query("");

    if let Some(tipo) = &updated_planejamento.tipo_planejamento {
        query.push_str(" tipo_planejamento = ?,");
        query_builder = query_builder.bind(tipo.to_string());
    }
    if let Some(valor_estimado) = updated_planejamento.valor_estimado {
        query.push_str(" valor_estimado = ?,");
        query_builder = query_builder.bind(valor_estimado);
    }
    if let Some(data_planejamento) = updated_planejamento.data_planejamento {
        query.push_str(" data_planejamento = ?,");
        query_builder = query_builder.bind(data_planejamento);
    }

    query.pop(); // Remove a última vírgula
    query.push_str(" WHERE planejamento_id = ?");
    let query_builder = sqlx::query(&query).bind(*planejamento_id);

    let result = query_builder.execute(db_pool.get_ref()).await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Planejamento atualizado com sucesso"),
        Err(e) => {
            println!("Erro ao atualizar planejamento: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao atualizar planejamento")
        }
    }
}

#[delete("/planejamento_financeiro/{planejamento_id}")]
async fn delete_planejamento(db_pool: web::Data<MySqlPool>, planejamento_id: web::Path<i32>) -> impl Responder {
    let result = sqlx::query("DELETE FROM planejamento_financeiro WHERE planejamento_id = ?")
        .bind(*planejamento_id)
        .execute(db_pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Planejamento deletado com sucesso"),
        Err(e) => {
            println!("Erro ao deletar planejamento: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao deletar planejamento")
        }
    }
}
