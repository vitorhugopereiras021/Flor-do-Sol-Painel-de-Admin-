<?php
require_once __DIR__ . '/config.php';

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
$token = null;

if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $token = $matches[1];
}

if (!$token) {
    json_response(['erro' => 'Token de autorização ausente.'], 401);
}

$stmt = $pdo->prepare("SELECT cargo, token_expires FROM usuarios WHERE token = ?");
$stmt->execute([$token]);
$usuario = $stmt->fetch();

if (!$usuario || strtotime($usuario['token_expires']) < time()) {
    json_response(['erro' => 'Sessão inválida ou expirada.'], 401);
}

if ($usuario['cargo'] !== 'admin') {
    json_response(['erro' => 'Acesso negado.'], 403);
}

// Processa as requisições de salvar/editar (unificadas em POST por conta dos arquivos)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $id = isset($_POST['id']) ? (int)$_POST['id'] : null;
    $nome = $_POST['nome'] ?? '';
    $preco = isset($_POST['preco']) ? (float)$_POST['preco'] : 0;
    $categoria = $_POST['categoria'] ?? '';
    $badge = !empty($_POST['badge']) ? $_POST['badge'] : null;
    $tamanho = !empty($_POST['tamanho']) ? $_POST['tamanho'] : null;
    $embalagem = !empty($_POST['embalagem']) ? $_POST['embalagem'] : null;
    $rega = !empty($_POST['rega']) ? $_POST['rega'] : null;
    $sol = !empty($_POST['sol']) ? $_POST['sol'] : null;
    $umidade = !empty($_POST['umidade']) ? $_POST['umidade'] : null;

    if (empty($nome) || $preco <= 0 || empty($categoria)) {
        json_response(['erro' => 'Campos obrigatórios ausentes.'], 400);
    }

    $caminhoImagem = $_POST['imagem_atual'] ?? 'assets/images/default.jpg';

    // TRATAMENTO DE UPLOAD DE ARQUIVO
    if (isset($_FILES['imagem_upload']) && $_FILES['imagem_upload']['error'] === UPLOAD_ERR_OK) {
        $arquivoTmp = $_FILES['imagem_upload']['tmp_name'];
        $nomeOriginal = $_FILES['imagem_upload']['name'];
        $extensao = strtolower(pathinfo($nomeOriginal, PATHINFO_EXTENSION));

        // Valida extensões permitidas
        $extensoesPermitidas = ['jpg', 'jpeg', 'png', 'webp'];
        if (!in_array($extensao, $extensoesPermitidas)) {
            json_response(['erro' => 'Formato de imagem inválido. Use JPG, PNG ou WEBP.'], 400);
        }

        // Gera um nome único para o arquivo não sobrescrever outros com o mesmo nome
        $novoNome = uniqid('prod_', true) . '.' . $extensao;
        
        // Caminho físico onde o arquivo será salvo no servidor de arquivos
        // Ajuste os níveis de "../" dependendo de onde sua pasta api/ fica em relação à raiz
        $diretorioDestino = __DIR__ . '/../assets/images/uploads/';
        
        if (!is_dir($diretorioDestino)) {
            mkdir($diretorioDestino, 0755, true);
        }

        $caminhoFisicoCompleto = $diretorioDestino . $novoNome;

        if (move_uploaded_file($arquivoTmp, $caminhoFisicoCompleto)) {
            // Caminho relativo que fica registrado no banco para o catálogo buscar
            $caminhoImagem = 'assets/images/uploads/' . $novoNome;
        } else {
            json_response(['erro' => 'Falha ao mover o arquivo para o diretório de destino.'], 500);
        }
    }

    if ($id) {
        // MODO EDIÇÃO (UPDATE)
        $sql = "UPDATE produtos SET 
                    nome = ?, preco = ?, categoria = ?, badge = ?, imagem = ?, 
                    tamanho = ?, embalagem = ?, rega = ?, sol = ?, umidade = ? 
                WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nome, $preco, $categoria, $badge, $caminhoImagem, $tamanho, $embalagem, $rega, $sol, $umidade, $id]);
        
        json_response(['sucesso' => 'Produto atualizado com sucesso!']);
    } else {
        // MODO CADASTRO (INSERT)
        $sql = "INSERT INTO produtos (nome, preco, categoria, badge, imagem, tamanho, embalagem, rega, sol, umidade) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nome, $preco, $categoria, $badge, $caminhoImagem, $tamanho, $embalagem, $rega, $sol, $umidade]);
        
        json_response(['sucesso' => 'Produto criado com sucesso!']);
    }
} 

// Mantém a rota de exclusão separada checando pelo método DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if (!$id) json_response(['erro' => 'ID não informado'], 400);

    $stmt = $pdo->prepare("DELETE FROM produtos WHERE id = ?");
    $stmt->execute([$id]);

    json_response(['sucesso' => 'Produto excluído com sucesso!']);
}