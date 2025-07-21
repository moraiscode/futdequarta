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
            $stmt = $pdo->prepare("SELECT name FROM players WHERE name LIKE ? COLLATE utf8mb4_0900_ai_ci LIMIT 10");
            $stmt->execute([$query . '%']);
            $players = $stmt->fetchAll(PDO::FETCH_COLUMN);
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
        // Criar índices (executar uma vez, se não existirem)
        $pdo->exec("CREATE INDEX idx_goals_player_name ON goals (player_name)");
        $pdo->exec("CREATE INDEX idx_ranking_history_created_at ON ranking_history (created_at)");

        // Obter ranking atual com uma única consulta otimizada
        $stmt = $pdo->prepare("SELECT c.name, c.goal_count, c.last_goal,
                              COALESCE(p.position, 0) as prev_position
                              FROM (
                                  SELECT p.name, COUNT(g.id) as goal_count, MAX(g.goal_datetime) as last_goal
                                  FROM players p
                                  LEFT JOIN goals g ON p.name = g.player_name
                                  GROUP BY p.name
                              ) c
                              LEFT JOIN (
                                  SELECT player_name, position
                                  FROM ranking_history
                                  ORDER BY created_at DESC
                                  LIMIT 1
                              ) p ON c.name = p.player_name
                              ORDER BY c.goal_count DESC, c.last_goal DESC
                              LIMIT 30");
        $stmt->execute();
        $currentRanking = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Salvar o ranking atual no histórico (assíncrono ou em batch, aqui simplificado)
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT INTO ranking_history (player_name, position, goal_count, last_goal) VALUES (?, ?, ?, ?)
                              ON DUPLICATE KEY UPDATE position = VALUES(position), goal_count = VALUES(goal_count), last_goal = VALUES(last_goal)");
        foreach ($currentRanking as $index => $player) {
            $stmt->execute([$player['name'], $index + 1, $player['goal_count'], $player['last_goal']]);
        }
        $pdo->commit();

        // Calcular variação e evolução
        $rankingWithVariation = [];
        foreach ($currentRanking as $index => $player) {
            $variation = $player['prev_position'] ? $player['prev_position'] - ($index + 1) : 0;
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