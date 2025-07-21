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
            $stmt = $pdo->prepare("INSERT INTO players (name) VALUES (?)");
            $stmt->execute([$name]);
        }
        $stmt = $pdo->prepare("INSERT INTO goals (player_name, goal_datetime) VALUES (?, ?)");
        $stmt->execute([$name, $datetime]);
        echo json_encode(['success' => true]);
    } elseif ($action === 'getWeeklyRanking') {
        // Verificar e criar índices apenas se não existirem
        $stmt = $pdo->query("SHOW INDEX FROM goals WHERE Key_name = 'idx_goals_player_name'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("CREATE INDEX idx_goals_player_name ON goals (player_name)");
        }
        $stmt = $pdo->query("SHOW INDEX FROM goals WHERE Key_name = 'idx_goals_goal_datetime'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("CREATE INDEX idx_goals_goal_datetime ON goals (goal_datetime)");
        }

        // Definir períodos
        $currentStart = date('Y-m-d 00:00:00', strtotime('monday this week')); // 2025-07-21 00:00:00
        $currentEnd = date('Y-m-d 23:59:59', strtotime('sunday this week'));   // 2025-07-27 23:59:59
        $prevStart = date('Y-m-d 00:00:00', strtotime('monday last week'));    // 2025-07-14 00:00:00
        $prevEnd = date('Y-m-d 23:59:59', strtotime('sunday last week'));      // 2025-07-20 23:59:59

        // Obter ranking atual contando os registros diretamente
        $stmt = $pdo->prepare("SELECT p.name, COALESCE(COUNT(g1.id), 0) as current_goal_count, MAX(g1.goal_datetime) as current_last_goal
                              FROM players p
                              LEFT JOIN goals g1 ON p.name = g1.player_name AND g1.goal_datetime BETWEEN ? AND ?
                              GROUP BY p.name
                              ORDER BY current_goal_count DESC, current_last_goal DESC
                              LIMIT 30");
        $stmt->execute([$currentStart, $currentEnd]);
        $currentRanking = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Obter ranking da semana anterior (para calcular o total de jogadores)
        $stmt = $pdo->prepare("SELECT p.name, COALESCE(COUNT(g2.id), 0) as prev_goal_count, MAX(g2.goal_datetime) as prev_last_goal
                              FROM players p
                              LEFT JOIN goals g2 ON p.name = g2.player_name AND g2.goal_datetime BETWEEN ? AND ?
                              GROUP BY p.name
                              ORDER BY prev_goal_count DESC, prev_last_goal DESC");
        $stmt->execute([$prevStart, $prevEnd]);
        $prevRankingData = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $totalPlayersPrev = count(array_filter($prevRankingData, fn($row) => $row['prev_goal_count'] > 0));
        $prevRanking = [];
        foreach ($prevRankingData as $index => $row) {
            if ($row['prev_goal_count'] > 0) {
                $prevRanking[$row['name']] = ['position' => $index + 1, 'goal_count' => $row['prev_goal_count'], 'last_goal' => $row['prev_last_goal']];
            }
        }

        // Calcular variação percentual
        $rankingWithVariation = [];
        foreach ($currentRanking as $index => $player) {
            $prevPosition = isset($prevRanking[$player['name']]) ? $prevRanking[$player['name']]['position'] : 0;
            $currentPosition = $index + 1;
            $variation = $prevPosition ? $prevPosition - $currentPosition : 0;
            $variationPercent = $totalPlayersPrev > 0 ? ($variation / $totalPlayersPrev) * 100 : 0;
            $evolution = $variation > 0 ? 'up' : ($variation < 0 ? 'down' : 'equal');
            $rankingWithVariation[] = array_merge($player, ['variation' => $variation, 'variation_percent' => $variationPercent, 'evolution' => $evolution]);
        }

        echo json_encode(['success' => true, 'ranking' => $rankingWithVariation]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ação inválida']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
?>