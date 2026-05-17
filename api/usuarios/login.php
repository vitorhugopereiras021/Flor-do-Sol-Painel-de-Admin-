<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['erro' => 'Método não permitido'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$senha = $data['senha'] ?? '';

if (!$email || !$senha) {
    json_response(['erro' => 'Informe email e senha'], 400);
}

$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($senha, $user['senha_hash'])) {
    json_response(['erro' => 'Email ou senha inválidos'], 401);
}

$token = gerar_token();
$expires = date('Y-m-d H:i:s', time() + 86400 * 30);

$stmt = $pdo->prepare("UPDATE usuarios SET token = ?, token_expires = ? WHERE id = ?");
$stmt->execute([$token, $expires, $user['id']]);

json_response([
    'token' => $token,
    'usuario' => [
        'id' => (int)$user['id'],
        'nome' => $user['nome'],
        'email' => $user['email'],
        'cargo' => $user['cargo']
    ],
]);
