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
            $stmt = $pdo->prepare("SELECT name FROM players WHERE name LIKE ? COLLATE utf8mb4_0900_ai_ci LIMIT 10");
            $stmt->execute([$query . '%']);
            $players = $stmt->fetchAll(PDO::FETCH_COLUMN);
            file_put_contents('debug.log', "Partial matches: " . implode(', ', $players) . "\n", FILE_APPEND);
        }
        echo json_encode(['players' => $players, 'count' => count($players)]);
    } elseif ($action === 'add') {
        $name = isset($_GET['name']) ? trim($_GET['name']) : '';
        if (empty($name) || strlen($name) < 2) {
            echo json_encode(['success' => false, 'error' => 'Nome do jogador deve ter pelo menos 2 caracteres']);
            exit;
        }
        $stmt = $pdo->prepare("SELECT id FROM players WHERE name = ? COLLATE utf8mb4_0900_ai_ci");
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
    } elseif ($action === 'getRanking') {
        // Salvar o ranking atual como histórico antes de calcular o novo
        $stmt = $pdo->prepare("SELECT p.name, COUNT(g.id) as goal_count, MAX(g.goal_datetime) as last_goal
                              FROM players p
                              LEFT JOIN goals g ON p.name = g.player_name
                              GROUP BY p.name
                              ORDER BY goal_count DESC, last_goal DESC");
        $stmt->execute();
        $currentRanking = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Salvar o ranking atual no histórico
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT INTO ranking_history (player_name, position, goal_count, last_goal) VALUES (?, ?, ?, ?)");
        foreach ($currentRanking as $index => $player) {
            $stmt->execute([$player['name'], $index + 1, $player['goal_count'], $player['last_goal']]);
        }
        $pdo->commit();

        // Obter o ranking anterior do histórico (último registro)
        $stmt = $pdo->query("SELECT player_name, position, goal_count, last_goal
                            FROM ranking_history
                            ORDER BY created_at DESC
                            LIMIT 1");
        $previousRanking = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calcular variação e evolução
        $rankingWithVariation = [];
        foreach ($currentRanking as $index => $player) {
            $prevPosition = null;
            foreach ($previousRanking as $prev) {
                if ($prev['player_name'] === $player['name']) {
                    $prevPosition = $prev['position'];
                    break;
                }
            }
            $variation = $prevPosition ? $prevPosition - ($index + 1) : 0;
            $evolution = $variation > 0 ? 'up' : ($variation < 0 ? 'down' : 'equal');
            $rankingWithVariation[] = array_merge($player, ['variation' => $variation, 'evolution' => $evolution]);
        }

        echo json_encode(['success' => true, 'ranking' => $rankingWithVariation]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ação inválida']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
?>