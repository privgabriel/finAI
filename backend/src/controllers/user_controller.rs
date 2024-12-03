use actix_web::{get, post, web, HttpResponse, Responder};
use sqlx::MySqlPool;
use serde::{Deserialize, Serialize};
use bcrypt::{hash, verify};
use jsonwebtoken::{encode, Header, EncodingKey};
use std::collections::HashMap;

#[derive(Deserialize, Serialize)]
struct NewUser {
    nome: String,
    email: String,
    senha: String,
}

#[derive(Deserialize)]
pub struct AuthUser {
    pub email: String,
    pub senha: String,
}

#[derive(sqlx::FromRow, Serialize)]
struct UserAuth {
    usuario_id: i32,
    senha_hash: Option<String>,
}

#[derive(Serialize)]
struct TokenResponse {
    token: String,
    usuario_id: i32,
}

fn gerar_token(usuario_id: i32) -> Result<String, actix_web::Error> {
    let mut claims = HashMap::new();
    claims.insert("usuario_id", usuario_id.to_string());

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret("sua_chave_secreta".as_ref()),
    )
    .map_err(|_| actix_web::error::ErrorInternalServerError("Erro ao gerar token"))
}

#[post("/register")]
async fn register_user(db_pool: web::Data<MySqlPool>, new_user: web::Json<NewUser>) -> impl Responder {
    let hashed_password = hash(&new_user.senha, 4).unwrap();

    let result = sqlx::query("INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)")
        .bind(&new_user.nome)
        .bind(&new_user.email)
        .bind(&hashed_password)
        .execute(db_pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Created().body("Usuário criado com sucesso"),
        Err(e) => {
            println!("Erro ao criar usuário: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao criar usuário")
        }
    }
}

#[post("/login_user")]
pub async fn login_user(db_pool: web::Data<MySqlPool>, user: web::Json<AuthUser>) -> impl Responder {
    let result = sqlx::query_as!(
        UserAuth,
        "SELECT usuario_id, senha_hash FROM usuarios WHERE email = ?",
        user.email
    )
    .fetch_one(db_pool.get_ref())
    .await;

    match result {
        Ok(user_auth) => {
            if let Some(hash) = user_auth.senha_hash {
                if verify(&user.senha, &hash).unwrap_or(false) {
                    match gerar_token(user_auth.usuario_id) {
                        Ok(token) => HttpResponse::Ok().json(TokenResponse {
                            token,
                            usuario_id: user_auth.usuario_id,
                        }),
                        Err(_) => HttpResponse::InternalServerError().body("Erro ao gerar token"),
                    }
                } else {
                    HttpResponse::Unauthorized().body("Credenciais inválidas")
                }
            } else {
                HttpResponse::Unauthorized().body("Usuário não possui senha configurada")
            }
        }
        Err(sqlx::Error::RowNotFound) => HttpResponse::Unauthorized().body("Usuário não encontrado"),
        Err(e) => {
            println!("Erro ao buscar usuário: {:?}", e);
            HttpResponse::InternalServerError().body("Erro interno no servidor")
        }
    }
}

#[get("/users")]
async fn get_users(db_pool: web::Data<MySqlPool>) -> impl Responder {
    let result = sqlx::query_as!(
        UserAuth,
        "SELECT usuario_id, senha_hash FROM usuarios"
    )
    .fetch_all(db_pool.get_ref())
    .await;

    match result {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(e) => {
            println!("Erro ao buscar usuários: {:?}", e);
            HttpResponse::InternalServerError().body("Erro ao buscar usuários")
        }
    }
}
