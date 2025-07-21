<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Ranking - Fut de Quarta</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
    .ranking-up {
        background-color: #e6f3e6;
        color: #006400;
    }

    .ranking-down {
        background-color: #f8e1e1;
        color: #8B0000;
    }

    .table th,
    .table td {
        text-align: center;
        vertical-align: middle;
    }

    .first-place {
        font-weight: bold;
    }

    .player-name {
        text-align: left !important;
        padding-left: 10px;
    }

    .mt-5 {
        margin: auto !important;
    }

    div#rankingTable_info {
        display: none;
    }

    @media (max-width: 768px) {
        .dataTables_paginate {
            width: 100%;
            text-align: center;
        }

        .player-name {
            padding-left: 5px;
        }
    }
    </style>
</head>

<body>
    <div class="container mt-5">
        <table id="rankingTable" class="table table-striped table-bordered" style="width:100%">
            <thead>
                <tr>
                    <th>Ícone</th>
                    <th>Nome do Jogador</th>
                    <th>Número de Gols</th>
                    <th>Último Gol</th>
                    <th>Variação no Ranking</th>
                    <th>Posição Atual</th>
                    <th>Evolução</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap5.min.js"></script>
    <script src="ranking.js"></script>
</body>

</html>