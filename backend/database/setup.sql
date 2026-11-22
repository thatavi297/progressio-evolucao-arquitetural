-- Execute no MySQL Workbench antes de iniciar o Fastify.
CREATE DATABASE IF NOT EXISTS progressio
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE progressio;

CREATE TABLE IF NOT EXISTS treinos (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  exercicios JSON NOT NULL,
  criado_em TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_treinos_nome (nome),
  INDEX idx_treinos_criado_id (criado_em, id)
) ENGINE=InnoDB;

-- Treino inicial igual ao projeto entregue na N1; não sobrescreve dados existentes.
INSERT INTO treinos (id, nome, exercicios)
VALUES ('treino-a', 'Treino A', JSON_ARRAY())
ON DUPLICATE KEY UPDATE id = id;
