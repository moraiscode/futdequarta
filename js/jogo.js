// Defina as variáveis globais no escopo da janela
window.players = window.players || [];
window.teamA = window.teamA || [];
window.teamB = window.teamB || [];
window.nextTeams = window.nextTeams || [];
window.scoreA = window.scoreA || 0;
window.scoreB = window.scoreB || 0;
window.timer = window.timer || 600;
window.timerInterval = window.timerInterval || null;
window.lastWinner = window.lastWinner || "A";
window.matchHistory = window.matchHistory || [];
window.goalScorers = window.goalScorers || [];

function saveState() {
  const state = {
    players: window.players,
    teamA: window.teamA,
    teamB: window.teamB,
    nextTeams: window.nextTeams,
    scoreA: window.scoreA,
    scoreB: window.scoreB,
    timer: window.timer,
    lastWinner: window.lastWinner,
    matchHistory: window.matchHistory,
    goalScorers: window.goalScorers,
  };
  localStorage.setItem("futDeQuartaState", JSON.stringify(state));
}

function loadState() {
  const savedState = localStorage.getItem("futDeQuartaState");
  if (savedState) {
    const state = JSON.parse(savedState);
    window.players = state.players || [];
    window.teamA = state.teamA || [];
    window.teamB = state.teamB || [];
    window.nextTeams = state.nextTeams || [];
    window.scoreA = state.scoreA || 0;
    window.scoreB = state.scoreB || 0;
    window.timer = state.timer || 600;
    window.lastWinner = state.lastWinner || "A";
    window.matchHistory = state.matchHistory || [];
    window.goalScorers = state.goalScorers || [];
    updateTeamsDisplay();
    updateTimerDisplay();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
});

function showSection(section) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.add("d-none"));
  document.getElementById(section).classList.remove("d-none");
  saveState();
}

function addPlayer() {
  const name = document.getElementById("playerName").value.trim();
  if (name && !window.players.some((p) => p.split(" (")[0] === name)) {
    const numberedName = `${name} (${window.players.length + 1})`;
    window.players.push(numberedName);
    updatePlayerList();
    document.getElementById("playerName").value = "";
    saveState();
  }
}

function updatePlayerList() {
  const playerList = document.getElementById("playerList");
  playerList.innerHTML = "";
  window.players.forEach((player, index) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";
    li.textContent = player;
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-danger btn-sm";
    removeBtn.textContent = "Remover";
    removeBtn.onclick = () => removePlayer(player.split(" (")[0]);
    li.appendChild(removeBtn);
    playerList.appendChild(li);
  });
  saveState();
}

function removePlayer(playerName) {
  window.players = window.players.filter(
    (p) => p.split(" (")[0] !== playerName
  );
  updatePlayerList();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function sortTeams() {
  if (window.players.length < 10) {
    alert("São necessários pelo menos 10 jogadores para sortear os times.");
    return;
  }
  const shuffled = shuffleArray([...window.players]);
  console.log("Shuffled players:", shuffled); // Depuração
  window.teamA = shuffled.slice(0, 5);
  window.teamB = shuffled.slice(5, 10);
  window.nextTeams = [];
  for (let i = 10; i < shuffled.length; i += 5) {
    window.nextTeams.push(shuffled.slice(i, i + 5));
  }
  window.goalScorers = [];
  updateTeamsDisplay();
  showSection("game");
  saveState(); // Garante que o estado seja salvo após o sorteio
}

// ... (mantém as demais funções como updateTeamsDisplay, substitutePlayer, deletePlayer, etc., ajustando para usar window.teamA, window.teamB, etc.)

function updateTeamsDisplay() {
  const teamAList = document.getElementById("teamA");
  const teamBList = document.getElementById("teamB");
  const scorerA = document.getElementById("scorerA");
  const scorerB = document.getElementById("scorerB");
  const nextTeamsDiv = document.getElementById("nextTeams");
  const sortedTeams = document.getElementById("sortedTeams");

  teamAList.innerHTML = "";
  teamBList.innerHTML = "";
  scorerA.innerHTML = '<option value="">Selecione o jogador</option>';
  scorerB.innerHTML = '<option value="">Selecione o jogador</option>';
  nextTeamsDiv.innerHTML = "";
  sortedTeams.innerHTML = "";

  console.log("Updating teams display:", {
    teamA: [...teamA],
    teamB: [...teamB],
    nextTeams: JSON.stringify(nextTeams),
  });

  teamA.forEach((player) => {
    const li = document.createElement("li");
    li.className = "list-group-item player-item";
    li.setAttribute("data-player", player);
    if (goalScorers.includes(player)) {
      li.classList.add("scorer");
    }
    const playerSpan = document.createElement("span");
    playerSpan.textContent = player;
    li.appendChild(playerSpan);
    const substituteBtn = document.createElement("span");
    substituteBtn.className = "substitute-btn";
    substituteBtn.textContent = "⮂";
    substituteBtn.onclick = () => toggleSubstituteDropdown(li);
    li.appendChild(substituteBtn);
    const deleteBtn = document.createElement("span");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.onclick = (event) => {
      event.stopPropagation();
      const playerName = li.getAttribute("data-player");
      console.log(
        `Delete button clicked for player: ${playerName}, teamId: teamA`
      );
      deletePlayer(playerName, "teamA");
    };
    li.appendChild(deleteBtn);
    const dropdown = document.createElement("select");
    dropdown.className = "substitute-dropdown form-select form-select-sm";
    dropdown.innerHTML = '<option value="">Selecione o substituto</option>';
    players
      .filter((p) => p !== player)
      .forEach((p) => {
        const option = document.createElement("option");
        option.value = p;
        option.textContent = p;
        dropdown.appendChild(option);
      });
    dropdown.onchange = () => {
      const playerName = li.getAttribute("data-player");
      substitutePlayer(playerName, dropdown.value, "teamA");
    };
    li.appendChild(dropdown);
    teamAList.appendChild(li);
    const scorerOption = document.createElement("option");
    scorerOption.value = player;
    scorerOption.textContent = player;
    scorerA.appendChild(scorerOption);
  });

  teamB.forEach((player) => {
    const li = document.createElement("li");
    li.className = "list-group-item player-item";
    li.setAttribute("data-player", player);
    if (goalScorers.includes(player)) {
      li.classList.add("scorer");
    }
    const playerSpan = document.createElement("span");
    playerSpan.textContent = player;
    li.appendChild(playerSpan);
    const substituteBtn = document.createElement("span");
    substituteBtn.className = "substitute-btn";
    substituteBtn.textContent = "⮂";
    substituteBtn.onclick = () => toggleSubstituteDropdown(li);
    li.appendChild(substituteBtn);
    const deleteBtn = document.createElement("span");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.onclick = (event) => {
      event.stopPropagation();
      const playerName = li.getAttribute("data-player");
      console.log(
        `Delete button clicked for player: ${playerName}, teamId: teamB`
      );
      deletePlayer(playerName, "teamB");
    };
    li.appendChild(deleteBtn);
    const dropdown = document.createElement("select");
    dropdown.className = "substitute-dropdown form-select form-select-sm";
    dropdown.innerHTML = '<option value="">Selecione o substituto</option>';
    players
      .filter((p) => p !== player)
      .forEach((p) => {
        const option = document.createElement("option");
        option.value = p;
        option.textContent = p;
        dropdown.appendChild(option);
      });
    dropdown.onchange = () => {
      const playerName = li.getAttribute("data-player");
      substitutePlayer(playerName, dropdown.value, "teamB");
    };
    li.appendChild(dropdown);
    teamBList.appendChild(li);
    const scorerOption = document.createElement("option");
    scorerOption.value = player;
    scorerOption.textContent = player;
    scorerB.appendChild(scorerOption);
  });

  nextTeams.forEach((team, index) => {
    const teamDiv = document.createElement("div");
    teamDiv.className = "team-box";
    teamDiv.innerHTML = `<h5>Próximo Time ${index + 1}</h5>`;
    const ul = document.createElement("ul");
    ul.className = "list-group";
    team.forEach((player) => {
      const li = document.createElement("li");
      li.className = "list-group-item player-item";
      li.setAttribute("data-player", player);
      const playerSpan = document.createElement("span");
      playerSpan.textContent = player;
      li.appendChild(playerSpan);
      const substituteBtn = document.createElement("span");
      substituteBtn.className = "substitute-btn";
      substituteBtn.textContent = "⮂";
      substituteBtn.onclick = () => toggleSubstituteDropdown(li);
      li.appendChild(substituteBtn);
      const deleteBtn = document.createElement("span");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
      deleteBtn.onclick = (event) => {
        event.stopPropagation();
        const playerName = li.getAttribute("data-player");
        console.log(
          `Delete button clicked for player: ${playerName}, teamId: nextTeam${index}`
        );
        console.log("NextTeams before deletion:", JSON.stringify(nextTeams));
        deletePlayer(playerName, `nextTeam${index}`);
      };
      li.appendChild(deleteBtn);
      const dropdown = document.createElement("select");
      dropdown.className = "substitute-dropdown form-select form-select-sm";
      dropdown.innerHTML = '<option value="">Selecione o substituto</option>';
      players
        .filter((p) => p !== player)
        .forEach((p) => {
          const option = document.createElement("option");
          option.value = p;
          option.textContent = p;
          dropdown.appendChild(option);
        });
      dropdown.onchange = () => {
        const playerName = li.getAttribute("data-player");
        substitutePlayer(playerName, dropdown.value, `nextTeam${index}`);
      };
      li.appendChild(dropdown);
      ul.appendChild(li);
    });
    teamDiv.appendChild(ul);
    nextTeamsDiv.appendChild(teamDiv);
  });

  console.log(
    "NextTeams DOM state:",
    Array.from(nextTeamsDiv.querySelectorAll(".player-item")).map((item) => ({
      player: item.getAttribute("data-player"),
      text: item.querySelector("span").textContent,
    }))
  );

  const tr = document.createElement("tr");
  tr.innerHTML = `
                <td>${teamA.join(", ")}</td>
                <td>${teamB.join(", ")}</td>
                <td>${nextTeams.map((team) => team.join(", ")).join("; ")}</td>
            `;
  sortedTeams.appendChild(tr);
}

function toggleSubstituteDropdown(playerItem) {
  const dropdown = playerItem.querySelector(".substitute-dropdown");
  const allDropdowns = document.querySelectorAll(".substitute-dropdown");
  allDropdowns.forEach((dd) => {
    if (dd !== dropdown) {
      dd.classList.remove("show");
    }
  });
  dropdown.classList.toggle("show");
}

function substitutePlayer(currentPlayer, newPlayer, teamId) {
  if (!newPlayer || !currentPlayer) {
    console.error(
      `Invalid players: currentPlayer=${currentPlayer}, newPlayer=${newPlayer}`
    );
    return;
  }
  console.log(`Substituting ${currentPlayer} with ${newPlayer} in ${teamId}`);
  console.log("Before substitution:", {
    teamA: [...teamA],
    teamB: [...teamB],
    nextTeams: JSON.stringify(nextTeams),
  });

  updateTeamsDisplay(); // Sincronizar DOM antes da substituição

  const normalizedCurrentPlayer = currentPlayer.trim();
  const normalizedNewPlayer = newPlayer.trim();

  if (teamId === "teamA") {
    const index = teamA.indexOf(normalizedCurrentPlayer);
    if (index === -1) {
      console.error(`Player ${normalizedCurrentPlayer} not found in teamA`);
      console.log(`Available players in teamA: ${JSON.stringify(teamA)}`);
      return;
    }
    if (teamB.includes(normalizedNewPlayer)) {
      const newIndex = teamB.indexOf(normalizedNewPlayer);
      teamA[index] = normalizedNewPlayer;
      teamB[newIndex] = normalizedCurrentPlayer;
    } else if (nextTeams.flat().includes(normalizedNewPlayer)) {
      let found = false;
      for (let i = 0; i < nextTeams.length; i++) {
        const newIndex = nextTeams[i].indexOf(normalizedNewPlayer);
        if (newIndex !== -1) {
          nextTeams[i][newIndex] = normalizedCurrentPlayer;
          teamA[index] = normalizedNewPlayer;
          found = true;
          break;
        }
      }
      if (!found) {
        console.error(`Player ${normalizedNewPlayer} not found in nextTeams`);
        console.log(
          `All nextTeams players: ${JSON.stringify(nextTeams.flat())}`
        );
        return;
      }
    } else {
      console.error(`Player ${normalizedNewPlayer} not found in any team`);
      console.log(`All players: ${JSON.stringify(players)}`);
      return;
    }
  } else if (teamId === "teamB") {
    const index = teamB.indexOf(normalizedCurrentPlayer);
    if (index === -1) {
      console.error(`Player ${normalizedCurrentPlayer} not found in teamB`);
      console.log(`Available players in teamB: ${JSON.stringify(teamB)}`);
      return;
    }
    if (teamA.includes(normalizedNewPlayer)) {
      const newIndex = teamA.indexOf(normalizedNewPlayer);
      teamB[index] = normalizedNewPlayer;
      teamA[newIndex] = normalizedCurrentPlayer;
    } else if (nextTeams.flat().includes(normalizedNewPlayer)) {
      let found = false;
      for (let i = 0; i < nextTeams.length; i++) {
        const newIndex = nextTeams[i].indexOf(normalizedNewPlayer);
        if (newIndex !== -1) {
          nextTeams[i][newIndex] = normalizedCurrentPlayer;
          teamB[index] = normalizedNewPlayer;
          found = true;
          break;
        }
      }
      if (!found) {
        console.error(`Player ${normalizedNewPlayer} not found in nextTeams`);
        console.log(
          `All nextTeams players: ${JSON.stringify(nextTeams.flat())}`
        );
        return;
      }
    } else {
      console.error(`Player ${normalizedNewPlayer} not found in any team`);
      console.log(`All players: ${JSON.stringify(players)}`);
      return;
    }
  } else if (teamId.startsWith("nextTeam")) {
    const teamIndex = parseInt(teamId.replace("nextTeam", ""), 10);
    if (teamIndex >= nextTeams.length || teamIndex < 0) {
      console.error(`Invalid team index: ${teamIndex}`);
      return;
    }
    const index = nextTeams[teamIndex].indexOf(normalizedCurrentPlayer);
    if (index === -1) {
      console.error(
        `Player ${normalizedCurrentPlayer} not found in nextTeam${teamIndex}`
      );
      console.log(
        `Available players in nextTeam${teamIndex}: ${JSON.stringify(
          nextTeams[teamIndex]
        )}`
      );
      return;
    }
    if (teamA.includes(normalizedNewPlayer)) {
      const newIndex = teamA.indexOf(normalizedNewPlayer);
      nextTeams[teamIndex][index] = normalizedNewPlayer;
      teamA[newIndex] = normalizedCurrentPlayer;
    } else if (teamB.includes(normalizedNewPlayer)) {
      const newIndex = teamB.indexOf(normalizedNewPlayer);
      nextTeams[teamIndex][index] = normalizedNewPlayer;
      teamB[newIndex] = normalizedCurrentPlayer;
    } else if (nextTeams.flat().includes(normalizedNewPlayer)) {
      for (let i = 0; i < nextTeams.length; i++) {
        if (i === teamIndex) continue;
        const newIndex = nextTeams[i].indexOf(normalizedNewPlayer);
        if (newIndex !== -1) {
          nextTeams[i][newIndex] = normalizedCurrentPlayer;
          nextTeams[teamIndex][index] = normalizedNewPlayer;
          break;
        }
      }
    } else {
      console.error(`Player ${normalizedNewPlayer} not found in any team`);
      console.log(`All players: ${JSON.stringify(players)}`);
      return;
    }
  }
  console.log("After substitution:", {
    teamA: [...teamA],
    teamB: [...teamB],
    nextTeams: JSON.stringify(nextTeams),
  });
  updateTeamsDisplay();
}

function deletePlayer(player, teamId) {
  console.log(`Attempting to delete ${player} from ${teamId}`);
  console.log("Current state:", {
    teamA: [...teamA],
    teamB: [...teamB],
    nextTeams: JSON.stringify(nextTeams),
    players: [...players],
  });

  const normalizedPlayer = player.trim();

  if (teamId === "teamA") {
    const index = teamA.indexOf(normalizedPlayer);
    if (index === -1) {
      console.error(`Player ${normalizedPlayer} not found in teamA`);
      console.log(`Available players in teamA: ${JSON.stringify(teamA)}`);
      return;
    }
    let replacementPlayer = null;
    if (nextTeams.length > 0) {
      const lastTeam = nextTeams[nextTeams.length - 1];
      if (lastTeam.length > 0) {
        replacementPlayer = lastTeam.pop();
        if (lastTeam.length === 0) {
          nextTeams.pop();
        }
      }
    }
    if (teamA.length > 1 || replacementPlayer) {
      teamA.splice(index, 1);
      if (replacementPlayer) {
        teamA.push(replacementPlayer);
      }
      players = players.filter((p) => p !== normalizedPlayer);
    } else {
      alert(
        "Não é possível remover o último jogador do Time A sem um substituto."
      );
      return;
    }
  } else if (teamId === "teamB") {
    const index = teamB.indexOf(normalizedPlayer);
    if (index === -1) {
      console.error(`Player ${normalizedPlayer} not found in teamB`);
      console.log(`Available players in teamB: ${JSON.stringify(teamB)}`);
      return;
    }
    let replacementPlayer = null;
    if (nextTeams.length > 0) {
      const lastTeam = nextTeams[nextTeams.length - 1];
      if (lastTeam.length > 0) {
        replacementPlayer = lastTeam.pop();
        if (lastTeam.length === 0) {
          nextTeams.pop();
        }
      }
    }
    if (teamB.length > 1 || replacementPlayer) {
      teamB.splice(index, 1);
      if (replacementPlayer) {
        teamB.push(replacementPlayer);
      }
      players = players.filter((p) => p !== normalizedPlayer);
    } else {
      alert(
        "Não é possível remover o último jogador do Time B sem um substituto."
      );
      return;
    }
  } else if (teamId.startsWith("nextTeam")) {
    const teamIndex = parseInt(teamId.replace("nextTeam", ""), 10);
    if (teamIndex >= nextTeams.length || teamIndex < 0) {
      console.error(`Invalid team index: ${teamIndex}`);
      return;
    }
    const index = nextTeams[teamIndex].indexOf(normalizedPlayer);
    if (index === -1) {
      console.error(
        `Player ${normalizedPlayer} not found in nextTeam${teamIndex}`
      );
      console.log(
        `Available players in nextTeam${teamIndex}: ${JSON.stringify(
          nextTeams[teamIndex]
        )}`
      );
      return;
    }
    nextTeams[teamIndex].splice(index, 1);
    players = players.filter((p) => p !== normalizedPlayer);
    if (nextTeams[teamIndex].length === 0) {
      nextTeams.splice(teamIndex, 1);
    }
  } else {
    console.error(`Invalid teamId: ${teamId}`);
    return;
  }
  console.log("After deletion:", {
    teamA: [...teamA],
    teamB: [...teamB],
    nextTeams: JSON.stringify(nextTeams),
    players: [...players],
  });
  updateTeamsDisplay();
}

function startMatch() {
  scoreA = 0;
  scoreB = 0;
  timer = 600;
  goalScorers = [];
  updateTeamsDisplay();
  updateTimerDisplay();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer--;
    updateTimerDisplay();
    if (timer <= 0) endMatch();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  document.getElementById("timer").textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
  const progressBar = document.getElementById("timerProgress");
  const percentage = (timer / 600) * 100;
  progressBar.style.width = `${percentage}%`;
  progressBar.setAttribute("aria-valuenow", percentage);
  if (timer > 300) {
    progressBar.className = "progress-bar bg-success";
  } else if (timer > 120) {
    progressBar.className = "progress-bar bg-primary";
  } else if (timer > 60) {
    progressBar.className = "progress-bar bg-warning";
  } else {
    progressBar.className = "progress-bar bg-danger";
  }
}

function scoreGoal(team) {
  const scorer =
    team === "A"
      ? document.getElementById("scorerA").value
      : document.getElementById("scorerB").value;
  if (!scorer) {
    alert("Selecione um jogador para marcar o gol.");
    return;
  }
  if (team === "A") scoreA++;
  else scoreB++;
  goalScorers.push(scorer);
  updateTeamsDisplay();
  if (Math.abs(scoreA - scoreB) >= 2 || scoreA >= 2 || scoreB >= 2) {
    endMatch();
  }
}

function endMatch() {
  clearInterval(timerInterval);
  let winner, loser;
  if (
    scoreA > scoreB ||
    (scoreA === 0 && scoreB === 0 && lastWinner === "A" && nextTeams.length < 2)
  ) {
    winner = teamA;
    loser = teamB;
    lastWinner = "A";
  } else if (
    scoreB > scoreA ||
    (scoreA === 0 && scoreB === 0 && lastWinner === "B" && nextTeams.length < 2)
  ) {
    winner = teamB;
    loser = teamA;
    lastWinner = "B";
  } else if (scoreA === scoreB && nextTeams.length >= 2) {
    winner = teamA;
    loser = teamB;
    lastWinner = "A";
  } else {
    winner = teamA;
    loser = teamB;
    lastWinner = "A";
  }

  matchHistory.push({
    teamA: [...teamA],
    teamB: [...teamB],
    scoreA,
    scoreB,
    winner: lastWinner,
    goalScorers: [...goalScorers],
  });

  const resultModal = new bootstrap.Modal(
    document.getElementById("endMatchModal")
  );
  const scorersList =
    goalScorers.length > 0
      ? `<br/><h6>Marcadores:</h6><ul>${goalScorers
          .map((scorer) => `<li>${scorer}</li>`)
          .join("")}</ul>`
      : "<p>Nenhum gol marcado.</p>";
  document.getElementById("matchResult").innerHTML = `
                Placar: Time A ${scoreA} x ${scoreB} Time B<br>
                <br/><strong>Vencedor: Time ${lastWinner}</strong><br>
                Time A: ${teamA.join(", ")}<br>
                Time B: ${teamB.join(", ")}<br>
                ${scorersList}
            `;
  const audio = new Audio("aviso.mp3");
  audio.play().catch((error) => console.error("Error playing sound:", error));
  resultModal.show();

  console.log("Before endMatch rotation:", {
    teamA: [...teamA],
    teamB: [...teamB],
    nextTeams: JSON.stringify(nextTeams),
  });

  let nextTeam = nextTeams.shift() || [];
  let newTeam = [...nextTeam];
  const playersNeeded = 5 - nextTeam.length;
  if (playersNeeded > 0) {
    const shuffledLoser = shuffleArray([...loser]);
    const completingPlayers = shuffledLoser.slice(0, playersNeeded);
    newTeam = [...nextTeam, ...completingPlayers];
    loser = shuffledLoser.slice(playersNeeded);
  }
  if (lastWinner === "A") {
    teamA = winner;
    teamB = newTeam;
  } else {
    teamA = newTeam;
    teamB = winner;
  }
  if (loser.length > 0) {
    nextTeams.push(loser); // Adiciona o time derrotado ao final da fila
  }

  console.log("After endMatch rotation:", {
    teamA: [...teamA],
    teamB: [...teamB],
    nextTeams: JSON.stringify(nextTeams),
  });
  goalScorers = [];
  updateTeamsDisplay();
  scoreA = 0;
  scoreB = 0;
  timer = 600;
  updateTimerDisplay();
}

function addPlayerDuringMatch() {
  const name = document.getElementById("newPlayerName").value.trim();
  if (name && !players.includes(name)) {
    players.push(name);
    let added = false;
    for (let i = 0; i < nextTeams.length; i++) {
      if (nextTeams[i].length < five) {
        nextTeams[i].push(name);
        added = true;
        break;
      }
    }
    if (!added) {
      nextTeams.push([name]);
    }
    console.log("After addPlayerDuringMatch:", {
      nextTeams: JSON.stringify(nextTeams),
    });
    updateTeamsDisplay();
    document.getElementById("newPlayerName").value = "";
    bootstrap.Modal.getInstance(
      document.getElementById("addPlayerModal")
    ).hide();
  }
}

function endDay() {
  const statsDiv = document.getElementById("generalStats");
  statsDiv.innerHTML = `
                <h4>Estatísticas do Dia</h4>
                <p>Partidas jogadas: ${matchHistory.length}</p>
                <p>Times mais vitoriosos: ${
                  lastWinner === "A" ? "Time A" : "Time B"
                }</p>
            `;
  showSection("stats");
}
