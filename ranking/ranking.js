$(document).ready(function() {
    loadRanking();

    function loadRanking() {
        $.ajax({
            url: "players.php?action=getWeeklyRanking",
            method: "GET",
            beforeSend: function() {
                $("#rankingTable").addClass("loading");
            },
            success: function(data) {
                $("#rankingTable").removeClass("loading");
                console.log("Resposta do servidor:", data); // Depuração
                if (!data.success) {
                    console.error("Erro ao carregar ranking:", data.error);
                    alert("Erro: " + data.error);
                    return;
                }
                const ranking = data.ranking.slice(0, 30);
                const tbody = $("#rankingTable tbody").empty();
                ranking.forEach((player, index) => {
                    const rankIcon = index === 0 ? '<i class="fa-solid fa-crown"></i>' :
                                index === 1 ? '<i class="fa-solid fa-medal"></i>' :
                                index === 2 ? '<i class="fa-solid fa-ranking-star"></i>' :
                                player.variation === 0 ? '<i class="fa-solid fa-equals"></i>' :
                                player.variation > 0 ? '<i class="fa-solid fa-arrow-up"></i>' :
                                '<i class="fa-solid fa-arrow-down"></i>';
                    const rowClass = index === 0 ? "first-place" :
                                   player.variation > 0 ? "up" :
                                   player.variation < 0 ? "down" : "";
                    const variationDisplay = player.variation !== 0 ? `${(player.variation_percent || 0).toFixed(1)}%` : "-";
                    tbody.append(`
                        <tr class="${rowClass}">
                            <td>${rankIcon}</td>
                            <td class="player-name">${index === 0 ? `<strong>${player.name}</strong>` : player.name}</td>
                            <td>${player.current_goal_count || 0}</td>
                            <td>${index + 1}</td>
                            <td>${variationDisplay}</td>
                        </tr>
                    `);
                });
            },
            error: function(xhr, status, error) {
                $("#rankingTable").removeClass("loading");
                console.error("Erro na requisição:", status, error);
                alert("Erro na conexão: Verifique o console para detalhes.");
            }
        });
    }
});