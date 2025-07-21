<?php
header('Content-Type: application/json');

$host = 'easypanel.moraiscode.com';
$port = 33063;
$dbname = 'futdequarta';
$user = 'futdequarta';
$password = '@5Wl17ru9';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($action === 'autocomplete') {
        $query = isset($_GET['name']) ? trim($_GET['name']) : '';
        $players = [];
        if (!empty($query)) {
            file_put_contents('debug.log', "Query: $query\n", FILE_APPEND);
            $stmt = $pdo->prepare("SELECT name FROM players WHERE name LIKE ? COLLATE utf8mb4_unicode_ci LIMIT 10");
            $stmt->execute([$query . '%']);
            $players = $stmt->fetchAll(PDO::FETCH_COLUMN);
            file_put_contents('debug.log', "Partial matches: " . implode(', ', $players) . "\n", FILE_APPEND);
        }
        echo json_encode(['players' => $players, 'count' => count($players)]);
    } elseif ($action === 'add') {
        $name = isset($_GET['name']) ? trim($_GET['name']) : '';
        if (empty($name) || strlen($name) < 2) { // Evita nomes curtos como "A"
            echo json_encode(['success' => false, 'error' => 'Nome do jogador deve ter pelo menos 2 caracteres']);
            exit;
        }
        $stmt = $pdo->prepare("SELECT id FROM players WHERE name = ? COLLATE utf8mb4_unicode_ci");
        $stmt->execute([$name]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => true, 'message' => 'Jogador já existe']);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO players (name) VALUES (?)");
        $stmt->execute([$name]);
        echo json_encode(['success' => true]);
    } elseif ($action === 'addGoal') {
    $name = isset($_GET['name']) ? trim($_GET['name']) : '';
    $datetime = isset($_GET['datetime']) ? trim($_GET['datetime']) : '';
    if (empty($name) || empty($datetime)) {
        echo json_encode(['success' => false, 'error' => 'Nome do jogador ou data/hora inválidos']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT name FROM players WHERE name = ? COLLATE utf8mb4_0900_ai_ci");
    $stmt->execute([$name]);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Jogador não encontrado']);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO goals (player_name, goal_datetime) VALUES (?, ?)");
    $stmt->execute([$name, $datetime]);
    echo json_encode(['success' => true]);
} 
     else {
        echo json_encode(['success' => false, 'error' => 'Ação inválida']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
?>