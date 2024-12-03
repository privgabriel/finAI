CREATE DATABASE fin_ai_db;
USE fin_ai_db;
CREATE TABLE usuarios (
                          usuario_id INT AUTO_INCREMENT PRIMARY KEY,
                          nome VARCHAR(100),
                          email VARCHAR(100) UNIQUE,
                          senha_hash VARCHAR(255),
                          dt_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE usuarios MODIFY COLUMN dt_criacao DATETIME DEFAULT CURRENT_TIMESTAMP;

SELECT * FROM usuarios;

CREATE TABLE transacoes (
                            transacao_id INT AUTO_INCREMENT PRIMARY KEY,
                            usuario_id INT,
                            tipo_transacao ENUM('Despesa', 'Receita', 'Salario'),
                            categoria VARCHAR(100),
                            valor DECIMAL(10, 2),
                            data_transacao DATE,
                            descricao VARCHAR(255),
                            FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);
ALTER TABLE transacoes MODIFY COLUMN tipo_transacao ENUM('Despesa', 'Receita', 'Salario');

SELECT
    u.nome AS nome_usuario,
    t.tipo_transacao,
    t.categoria,
    t.valor
FROM
    transacoes as t
INNER JOIN usuarios AS u
    ON u.usuario_id = t.usuario_id;

CREATE TABLE metas_orcamento (
                                 meta_id INT AUTO_INCREMENT PRIMARY KEY,
                                 usuario_id INT,
                                 meta_tipo ENUM('Orçamento', 'Economia'),
                                 valor_meta DECIMAL(10, 2),
                                 valor_atual DECIMAL(10, 2) DEFAULT 0,
                                 data_meta DATE,
                                 FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);


CREATE TABLE planejamento_financeiro (
                                         planejamento_id INT AUTO_INCREMENT PRIMARY KEY,
                                         usuario_id INT,
                                         tipo_planejamento ENUM('Aposentadoria', 'Investimento'),
                                         valor_estimado DECIMAL(10, 2),
                                         data_planejamento DATE,
                                         FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

