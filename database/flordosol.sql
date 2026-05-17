-- ============================================================
-- FLOR DO SOL - Banco de Dados
-- MySQL 8+ / MariaDB 10+
-- Execute este script no phpMyAdmin ou via linha de comando
-- ============================================================

CREATE DATABASE IF NOT EXISTS flordosol
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE flordosol;

-- ================= USUÁRIOS =================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(5) NOT NULL,
    telefone VARCHAR(20) DEFAULT NULL,
    token VARCHAR(64) DEFAULT NULL,
    token_expires DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ================= PRODUTOS =================
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    categoria ENUM('plantas','arranjos','servicos') NOT NULL,
    badge VARCHAR(50) DEFAULT NULL,
    imagem VARCHAR(200) NOT NULL,
    avaliacao INT DEFAULT 5,
    reviews INT DEFAULT 0,
    tamanho VARCHAR(50) DEFAULT NULL,
    embalagem VARCHAR(100) DEFAULT NULL,
    rega VARCHAR(100) DEFAULT NULL,
    sol VARCHAR(100) DEFAULT NULL,
    umidade VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ================= PEDIDOS =================
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT DEFAULT NULL,
    total DECIMAL(10,2) NOT NULL,
    frete DECIMAL(10,2) DEFAULT 0,
    status ENUM('novo','confirmado','enviado','entregue','cancelado') DEFAULT 'novo',
    forma_pagamento VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================= ITENS DO PEDIDO =================
CREATE TABLE IF NOT EXISTS itens_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT DEFAULT NULL,
    nome_produto VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    personalizacao JSON DEFAULT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================= ENTREGAS =================
CREATE TABLE IF NOT EXISTS entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(200) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100) DEFAULT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================= CONFIGURAÇÕES =================
CREATE TABLE IF NOT EXISTS config (
    chave VARCHAR(50) PRIMARY KEY,
    valor VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

INSERT INTO config (chave, valor) VALUES ('whatsapp_number', '5511999999999');

-- ================= SEED: PRODUTOS =================
-- Dados extraídos do catalogo.js original
INSERT INTO produtos (id, nome, preco, categoria, badge, imagem, avaliacao, reviews, tamanho, embalagem, rega, sol, umidade) VALUES
(1,  'Orquídea Branca',      89.90,  'plantas',  'Popular',  'assets/images/rox.jpeg',           5, 24, '25x35cm',  'Vaso de Cerâmica',  '2x por semana',   'Meia sombra',     '60%'),
(2,  'Samambaia Verde',      49.90,  'plantas',  NULL,       'assets/images/pal.jpeg',           4, 18, '20x30cm',  'Vaso Plástico',     '3x por semana',   'Sombra parcial',  '70%'),
(3,  'Arranjo Luxo Rosas',   129.90, 'arranjos', 'Popular',  'assets/images/arranjos.jpeg',      5, 42, '40x50cm',  'Papel Kraft Premium + Fita', 'Diariamente', 'Luz indireta', '65%'),
(4,  'Suculenta Mini',       29.90,  'plantas',  'Novidade', 'assets/images/sub.jpeg',           4, 12, '10x15cm',  'Vaso de Barro',     '1x por semana',   'Sol direto',      '40%'),
(5,  'Cesta Presente',       159.90, 'servicos', NULL,       'assets/images/arm.jpeg',           5, 31, '45x35cm',  'Cesta de Vime + Laço', 'Conforme item', 'Luz filtrada',  '60%'),
(6,  'Buquê Especial',       99.90,  'arranjos', NULL,       'assets/images/floo.jpeg',          5, 28, '35x45cm',  'Papel Seda + Celofane', 'Não aplicável', 'Luz indireta',  '55%'),
(7,  'Arranjo Flores do Campo', 69.90, 'arranjos', 'Novidade', 'assets/images/papoulas.jpg',    4, 15, '30x40cm',  'Vaso de Vidro + Juta', 'Diariamente',   'Luz indireta',  '60%'),
(8,  'Manutenção de Jardins', 79.90,  'servicos', NULL,       'assets/images/serviços.jpeg',     5, 22, 'Área externa', 'Kit profissional', 'Incluso',        'Conforme necessidade', '—'),
(9,  'Projeto Paisagístico',  149.90, 'servicos', 'Popular',  'assets/images/plantas.jpeg',       5, 35, 'Personalizado', 'Consultoria + Croqui', 'Orientação inclusa', 'Análise do local', '—'),
(10, 'Lírio da Paz',         69.90,  'plantas',  'Novidade', 'assets/images/jardimSofisticado.png', 4, 20, '30x40cm', 'Vaso de Cerâmica',  '2x por semana',   'Meia sombra',     '65%'),
(11, 'Vaso de Girassóis',    89.90,  'arranjos', NULL,       'assets/images/rega.png',           4, 17, '35x45cm',  'Vaso Decorado + Fita', 'Diariamente',   'Sol direto',      '50%'),
(12, 'Kit Terrário',         59.90,  'servicos', 'Novidade', 'assets/images/Cuidarplanta.png',    4, 14, '20x20cm',  'Vidro + Kit montagem', '1x por semana',  'Luz indireta',  '70%');
