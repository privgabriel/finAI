mod controllers;
mod models;
use actix_web::{web, App, HttpServer, HttpResponse, Responder};
use dotenv::dotenv;
use sqlx::mysql::MySqlPoolOptions;
use std::env;
use crate::controllers::fin_ai_controller::analyze_finances;
use crate::controllers::user_controller::{register_user, login_user, get_users};
use crate::controllers::transacao_controller::{get_transacoes, get_transacoes_by_user, create_transacao, update_transacao, delete_transacao, delete_all_transacoes};
use crate::controllers::meta_orcamento_controller::{get_metas_orcamento, create_meta_orcamento,update_meta_orcamento, delete_meta_orcamento};
use crate::controllers::planejamento_financeiro_controller::{get_planejamentos, create_planejamento, update_planejamento, delete_planejamento};
async fn health_check() -> impl Responder {
    HttpResponse::Ok().body("Servidor funcionando!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL não está definida");

    let db_pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Falha ao conectar ao banco de dados");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(db_pool.clone()))  // Passa a pool de conexões para o app
            .route("/health", web::get().to(health_check))
            .service(analyze_finances)
            .service(get_users)
            .service(register_user)
            .service(login_user)
            .service(get_transacoes)
            .service(get_transacoes_by_user)
            .service(create_transacao)
            .service(update_transacao)
            .service(delete_transacao)
            .service(delete_all_transacoes)
            .service(get_metas_orcamento)
            .service(create_meta_orcamento)
            .service(update_meta_orcamento)
            .service(update_meta_orcamento)
            .service(delete_meta_orcamento)
            .service(get_planejamentos)
            .service(create_planejamento)
            .service(update_planejamento)
            .service(delete_planejamento)
    })
        .bind("18.231.225.79:8080")?//SUBSTITUIR POR IP DO SERVIDOR
        .run()
        .await
}
