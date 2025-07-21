<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ranking Semanal - Fut de Quarta</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .table th, .table td { text-align: center; vertical-align: middle; }
        .first-place { font-weight: bold; }
        .up { color: green; }
        .down { color: red; }
        .loading { opacity: 0.5; }
        .player-name { text-align: left !important; padding-left: 15px; }
        table#rankingTable {
    margin-bottom: 10%;
}
    </style>
</head>
<body>
    <div class="container mt-5">
        <img src="../design/logo_minimal.png" alt="" class="img-fluid mb-4 d-block mx-auto">
        <!-- <h1 class="text-center mb-4">Ranking Geral</h1> -->
        <p class="text-center mb-4">Confira o ranking dos jogadores com mais gols no somatório geral (desde 2025)</p>
        
        <table id="rankingTable" class="table table-striped table-bordered loading" style="width:100%">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Nome</th>
                    <th>Gols</th>
                    <th>Posição</th>
                    <th>Variação</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="ranking.js"></script>
</body>
</html>