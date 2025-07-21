document.addEventListener("DOMContentLoaded", () => {
  loadRanking();
});

function loadRanking() {
  fetch("../players.php?action=getRanking")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        console.error("Erro ao carregar ranking:", data.error);
        return;
      }
      const currentRanking = data.ranking;
      const tableData = currentRanking
        .map((player, index) => {
          let evolutionIcon =
            player.evolution === "up"
              ? '<i class="fa-solid fa-arrow-up"></i>'
              : player.evolution === "down"
              ? '<i class="fa-solid fa-arrow-down"></i>'
              : '<i class="fa-solid fa-equals"></i>';
          let rowClass =
            player.variation > 0
              ? "ranking-up"
              : player.variation < 0
              ? "ranking-down"
              : "";
          let rankIcon =
            index === 0
              ? '<i class="fa-solid fa-crown"></i>'
              : index === 1
              ? '<i class="fa-solid fa-trophy"></i>'
              : index === 2
              ? '<i class="fa-solid fa-medal"></i>'
              : evolutionIcon;
          let lastGoalDisplay = "-";
          if (player.last_goal) {
            const date = new Date(player.last_goal);
            lastGoalDisplay = date.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "numeric",
              timeZone: "America/Sao_Paulo",
            });
          }
          return [
            rankIcon,
            index === 0 ? `<strong>${player.name}</strong>` : player.name,
            player.goal_count,
            lastGoalDisplay,
            player.variation,
            index + 1,
            evolutionIcon,
          ];
        })
        .slice(0, 30); // Limita aos 30 primeiros

      if ($.fn.DataTable.isDataTable("#rankingTable")) {
        $("#rankingTable").DataTable().clear().rows.add(tableData).draw();
      } else {
        $("#rankingTable").DataTable({
          data: tableData,
          columns: [
            { title: "Rank" },
            {
              title: "Nome",
              className: "player-name", // Alinha à esquerda
            },
            { title: "Gols" },
            { title: "Último" },
            { title: "Variação" },
            { title: "Posição" },
            { title: "Evolução" },
          ],
          pageLength: 10, // Exibe os 30 de uma vez
          lengthChange: false,
          searching: false,
          paging: true, // Desativa a paginação
          language: {
            url: "//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json",
          },
          rowCallback: (row, data) => {
            if (data[4] > 0) $(row).addClass("ranking-up");
            else if (data[4] < 0) $(row).addClass("ranking-down");
            if (data[5] === 1) $(row).addClass("first-place");
          },
        });
      }
    })
    .catch((error) => console.error("Erro ao carregar ranking:", error));
}
