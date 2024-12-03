use actix_web::{get, web, HttpResponse, Responder};
use sqlx::MySqlPool;
use crate::models::transacao::Transacao;
use rust_decimal::prelude::ToPrimitive; // Importação do trait ToPrimitive para usar to_f64()

#[get("/fin-ai/{usuario_id}")]
async fn analyze_finances(db_pool: web::Data<MySqlPool>, usuario_id: web::Path<i32>) -> impl Responder {
    let result = sqlx::query_as::<_, Transacao>("SELECT * FROM transacoes WHERE usuario_id = ?")
        .bind(*usuario_id)
        .fetch_all(db_pool.get_ref())
        .await;

    match result {
        Ok(transacoes) => {
            let suggestions = analyze_finances_logic(transacoes);
            HttpResponse::Ok().json(suggestions)
        },
        Err(e) => {
            println!("Erro ao buscar transações do usuário: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao buscar transações do usuário")
        }
    }
}

fn analyze_finances_logic(transacoes: Vec<Transacao>) -> Vec<String> {
    // Corrigir para usar `tipo_transacao` no lugar de `tipo`
    let total_income = transacoes.iter()
        .filter(|&t| t.tipo_transacao == "Receita")
        .map(|t| t.valor.to_f64().unwrap())
        .sum::<f64>();

    let total_expense = transacoes.iter()
        .filter(|&t| t.tipo_transacao == "Despesa")
        .map(|t| t.valor.to_f64().unwrap())
        .sum::<f64>();

    let savings = total_income - total_expense;

    let mut suggestions = Vec::new();

    if savings > 1000.0 {
        suggestions.push(format!("Você pode investir R$ {} em renda fixa.", (savings * 0.3).to_f64().unwrap()));
    } else if savings < 0.0 {
        suggestions.push("Considere reduzir despesas desnecessárias.".to_string());
    }

    suggestions
}
