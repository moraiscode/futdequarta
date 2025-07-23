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

    <!-- ###################### -->

    <!-- SEO -->
    <meta
      name="description"
      content="Gerencie partidas de futebol casuais com sorteio de times, controle de gols, substituições e estatísticas. Ideal para peladas semanais."
    />
    <meta
      name="keywords"
      content="futebol, pelada, fut de quarta, sorteio de times, controle de jogo, estatísticas futebol, time de futebol, partida amadora"
    />
    <meta name="author" content="Fut de Quarta" />
    <meta name="robots" content="index, follow" />

    <!-- Open Graph / Facebook -->
    <meta
      property="og:title"
      content="Fut de Quarta – Gerenciador de Partidas de Futebol"
    />
    <meta
      property="og:description"
      content="Organize sua pelada semanal com sorteios, controle de tempo, gols e estatísticas. Interface amigável e dinâmica."
    />
    <meta property="og:image" content="../otg.png" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://futdequarta.moraiscode.com/" />
    <!-- substitua pelo domínio real -->

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta
      name="twitter:title"
      content="Fut de Quarta – Gerenciador de Partidas de Futebol"
    />
    <meta
      name="twitter:description"
      content="Sorteio de times, placar, rotação e estatísticas para futebol recreativo."
    />
    <meta name="twitter:image" content="../otg.png" />

    <!-- FAVICON -->
    <link
      rel="icon"
      type="image/png"
      href="../favicon/favicon-96x96.png"
      sizes="96x96"
    />
    <link rel="icon" type="image/svg+xml" href="favicon/favicon.svg" />
    <link rel="shortcut icon" href="../favicon/favicon.ico" />
    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href="../favicon/apple-touch-icon.png"
    />
    <meta name="apple-mobile-web-app-title" content="FutdeQuarta" />
    <link rel="manifest" href="../favicon/site.webmanifest" />

</head>
<body>
    <div class="container mt-5">
        <img src="../design/logo_minimal.png" alt="" class="img-fluid mb-4 d-block mx-auto"> 
        <!-- <h1 class="text-center mb-4">Ranking Geral</h1> -->
        <p class="text-center mb-4 text-secondary">Confira o ranking dos jogadores com mais gols no somatório geral (desde 2025). Neste ranking, só os 30 primeiros.</p>
        
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