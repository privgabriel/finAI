use actix_web::{get, post, put, delete, web, HttpResponse, Responder};
use sqlx::MySqlPool;
use chrono::NaiveDate;
use serde::Deserialize;
use rust_decimal::Decimal;

use crate::models::meta_orcamento::{MetaOrcamento, MetaTipo};

#[derive(Deserialize)]
pub struct NewMetaOrcamento {
    pub usuario_id: i32,
    pub meta_tipo: MetaTipo,
    pub valor_meta: Decimal,
    pub data_meta: NaiveDate,
}

#[get("/metas_orcamento")]
async fn get_metas_orcamento(db_pool: web::Data<MySqlPool>) -> impl Responder {
    let result = sqlx::query_as::<_, MetaOrcamento>("SELECT * FROM metas_orcamento")
        .fetch_all(db_pool.get_ref())
        .await;

    match result {
        Ok(metas) => HttpResponse::Ok().json(metas),
        Err(e) => {
            println!("Erro ao buscar metas: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao buscar metas")
        }
    }
}

#[post("/metas_orcamento")]
async fn create_meta_orcamento(
    db_pool: web::Data<MySqlPool>,
    new_meta: web::Json<NewMetaOrcamento>,
) -> impl Responder {
    let result = sqlx::query(
        "INSERT INTO metas_orcamento (usuario_id, meta_tipo, valor_meta, valor_atual, data_meta) VALUES (?, ?, ?, 0, ?)"
    )
        .bind(new_meta.usuario_id)
        .bind(new_meta.meta_tipo.to_string()) // Converte MetaTipo para String
        .bind(new_meta.valor_meta)
        .bind(new_meta.data_meta)
        .execute(db_pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Created().body("Meta criada com sucesso"),
        Err(e) => {
            println!("Erro ao criar meta: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao criar meta")
        }
    }
}

#[derive(Deserialize)]
struct UpdateMetaOrcamento {
    pub meta_tipo: Option<MetaTipo>,
    pub valor_meta: Option<Decimal>,
    pub valor_atual: Option<Decimal>,
    pub data_meta: Option<NaiveDate>,
}

#[put("/metas_orcamento/{meta_id}")]
async fn update_meta_orcamento(
    db_pool: web::Data<MySqlPool>,
    meta_id: web::Path<i32>,
    updated_meta: web::Json<UpdateMetaOrcamento>,
) -> impl Responder {
    let mut query = "UPDATE metas_orcamento SET".to_string();
    let mut query_builder = sqlx::query("");

    if let Some(tipo) = &updated_meta.meta_tipo {
        query.push_str(" meta_tipo = ?,");
        query_builder = query_builder.bind(tipo.to_string());
    }
    if let Some(valor_meta) = updated_meta.valor_meta {
        query.push_str(" valor_meta = ?,");
        query_builder = query_builder.bind(valor_meta);
    }
    if let Some(valor_atual) = updated_meta.valor_atual {
        query.push_str(" valor_atual = ?,");
        query_builder = query_builder.bind(valor_atual);
    }
    if let Some(data_meta) = updated_meta.data_meta {
        query.push_str(" data_meta = ?,");
        query_builder = query_builder.bind(data_meta);
    }

    query.pop(); // Remove a última vírgula
    query.push_str(" WHERE meta_id = ?");
    let query_builder = sqlx::query(&query).bind(*meta_id);

    let result = query_builder.execute(db_pool.get_ref()).await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Meta atualizada com sucesso"),
        Err(e) => {
            println!("Erro ao atualizar meta: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao atualizar meta")
        }
    }
}

#[delete("/metas_orcamento/{meta_id}")]
async fn delete_meta_orcamento(db_pool: web::Data<MySqlPool>, meta_id: web::Path<i32>) -> impl Responder {
    let result = sqlx::query("DELETE FROM metas_orcamento WHERE meta_id = ?")
        .bind(*meta_id)
        .execute(db_pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Meta deletada com sucesso"),
        Err(e) => {
            println!("Erro ao deletar meta: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao deletar meta")
        }
    }
}
