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

    // Lógica para distribuir nos times com máximo de 4 por time
    if (window.teamA.length < 4) {
      window.teamA.push(numberedName);
    } else if (window.teamB.length < 4) {
      window.teamB.push(numberedName);
    } else {
      let lastTeam = window.nextTeams[window.nextTeams.length - 1];
      if (!lastTeam || lastTeam.length >= 4) {
        window.nextTeams.push([numberedName]);
      } else {
        lastTeam.push(numberedName);
      }
    }

    document.getElementById("playerName").value = "";
    updateTeamsDisplay();
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
  if (window.players.length < 8) {
    alert("São necessários pelo menos 8 jogadores para sortear os times.");
    return;
  }
  const shuffled = shuffleArray([...window.players]);
  window.teamA = shuffled.slice(0, 4); // Time A com 4 jogadores
  window.teamB = shuffled.slice(4, 8); // Time B com 4 jogadores
  window.nextTeams = [];
  for (let i = 8; i < shuffled.length; i += 4) {
    const nextTeam = shuffled.slice(i, i + 4);
    if (nextTeam.length > 0) {
      window.nextTeams.push(nextTeam);
    }
  }
  window.goalScorers = [];
  updateTeamsDisplay();
  showSection("game");
  saveState();
}

function updateTeamsDisplay() {
  const teamAList = document.getElementById("teamA");
  const teamBList = document.getElementById("teamB");
  const scorerA = document.getElementById("scorerA");
  const scorerB = document.getElementById("scorerB");
  const nextTeamsDiv = document.getElementById("nextTeams");
  const sortedTeams = document.getElementById("sortedTeams");

  teamAList.innerHTML = "";
  teamBList.innerHTML = "";
  scorerA.innerHTML = '<option value="">Selecione o jogador que fez o gol</option>';
  scorerB.innerHTML = '<option value="">Selecione o jogador que fez o gol</option>';
  nextTeamsDiv.innerHTML = "";
  sortedTeams.innerHTML = "";

  window.teamA.forEach((player) => {
    const li = document.createElement("li");
    li.className = "list-group-item player-item";
    li.setAttribute("data-player", player);
    li.setAttribute("draggable", "true");
    li.addEventListener("dragstart", dragStart);
    if (window.goalScorers.includes(player)) {
      li.classList.add("scorer");
    }
    const playerSpan = document.createElement("span");
    playerSpan.textContent = player;
    li.appendChild(playerSpan);
    const substituteBtn = document.createElement("span");
    substituteBtn.className = "substitute-btn";
    substituteBtn.innerHTML = '<i class="fas fa-exchange-alt"></i>';
    substituteBtn.onclick = () => toggleSubstituteDropdown(li);
    li.appendChild(substituteBtn);
    const deleteBtn = document.createElement("span");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.onclick = (event) => {
      event.stopPropagation();
      const playerName = li.getAttribute("data-player");
      deletePlayer(playerName, "teamA");
    };
    li.appendChild(deleteBtn);
    const dropdown = document.createElement("select");
    dropdown.className = "substitute-dropdown form-select form-select-sm";
    dropdown.innerHTML = '<option value="">Selecione o substituto</option>';
    window.players
      .filter((p) => p !== player)
      .sort((a, b) => a.localeCompare(b)) // Ordenação alfabética
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

  window.teamB.forEach((player) => {
    const li = document.createElement("li");
    li.className = "list-group-item player-item";
    li.setAttribute("data-player", player);
    li.setAttribute("draggable", "true");
    li.addEventListener("dragstart", dragStart);
    if (window.goalScorers.includes(player)) {
      li.classList.add("scorer");
    }
    const playerSpan = document.createElement("span");
    playerSpan.textContent = player;
    li.appendChild(playerSpan);
    const substituteBtn = document.createElement("span");
    substituteBtn.className = "substitute-btn";
    substituteBtn.innerHTML = '<i class="fas fa-exchange-alt"></i>';
    substituteBtn.onclick = () => toggleSubstituteDropdown(li);
    li.appendChild(substituteBtn);
    const deleteBtn = document.createElement("span");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.onclick = (event) => {
      event.stopPropagation();
      const playerName = li.getAttribute("data-player");
      deletePlayer(playerName, "teamB");
    };
    li.appendChild(deleteBtn);
    const dropdown = document.createElement("select");
    dropdown.className = "substitute-dropdown form-select form-select-sm";
    dropdown.innerHTML = '<option value="">Selecione o substituto</option>';
    window.players
      .filter((p) => p !== player)
      .sort((a, b) => a.localeCompare(b)) // Ordenação alfabética
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

  window.nextTeams.forEach((team, index) => {
    const teamDiv = document.createElement("div");
    teamDiv.className = "team-box";
    teamDiv.setAttribute("data-team", `nextTeam${index}`);
    teamDiv.addEventListener("dragover", dragOver);
    teamDiv.addEventListener("drop", drop);
    teamDiv.innerHTML = `<h5>Próximo Time ${index + 1}</h5>`;
    const ul = document.createElement("ul");
    ul.className = "list-group";
    ul.setAttribute("id", `nextTeam${index}`);
    ul.addEventListener("dragover", dragOver);
    ul.addEventListener("drop", drop);
    team.forEach((player) => {
      const li = document.createElement("li");
      li.className = "list-group-item player-item";
      li.setAttribute("data-player", player);
      li.setAttribute("draggable", "true");
      li.addEventListener("dragstart", dragStart);
      const playerSpan = document.createElement("span");
      playerSpan.textContent = player;
      li.appendChild(playerSpan);
      const substituteBtn = document.createElement("span");
      substituteBtn.className = "substitute-btn";
      substituteBtn.innerHTML = '<i class="fas fa-exchange-alt"></i>';
      substituteBtn.onclick = () => toggleSubstituteDropdown(li);
      li.appendChild(substituteBtn);
      const deleteBtn = document.createElement("span");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
      deleteBtn.onclick = (event) => {
        event.stopPropagation();
        const playerName = li.getAttribute("data-player");
        deletePlayer(playerName, `nextTeam${index}`);
      };
      li.appendChild(deleteBtn);
      const dropdown = document.createElement("select");
      dropdown.className = "substitute-dropdown form-select form-select-sm";
      dropdown.innerHTML = '<option value="">Selecione o substituto</option>';
      window.players
        .filter((p) => p !== player)
        .sort((a, b) => a.localeCompare(b)) // Ordenação alfabética
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

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${window.teamA.join(", ")}</td>
    <td>${window.teamB.join(", ")}</td>
    <td>${window.nextTeams.map((team) => team.join(", ")).join("; ")}</td>
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

let draggedPlayer = null;
let draggedFrom = null;

function dragStart(e) {
  draggedPlayer = e.target.getAttribute("data-player");
  draggedFrom = e.target.closest("ul")?.id || e.target.closest(".team-box")?.getAttribute("data-team");
  e.dataTransfer.setData("text/plain", draggedPlayer);
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  const droppedPlayer = e.dataTransfer.getData("text/plain");
  const dropTarget = e.target.closest(".team-box")?.getAttribute("data-team") || e.target.closest("ul")?.id;

  if (draggedPlayer && dropTarget && draggedFrom !== dropTarget) {
    const fromTeam = draggedFrom === "teamA" ? window.teamA :
                     draggedFrom === "teamB" ? window.teamB :
                     draggedFrom.startsWith("nextTeam") ? window.nextTeams[parseInt(draggedFrom.replace("nextTeam", ""))] : null;
    const toTeam = dropTarget === "teamA" ? window.teamA :
                   dropTarget === "teamB" ? window.teamB :
                   dropTarget.startsWith("nextTeam") ? window.nextTeams[parseInt(dropTarget.replace("nextTeam", ""))] : null;

    if (fromTeam && toTeam && toTeam.length < 4) {
      const fromIndex = fromTeam.indexOf(draggedPlayer);
      if (fromIndex !== -1) {
        fromTeam.splice(fromIndex, 1);
        toTeam.push(draggedPlayer);
        updateTeamsDisplay();
        saveState();
      }
    } else if (toTeam && toTeam.length >= 4) {
      alert("Este time já está cheio (máximo de 4 jogadores).");
    }
  }
  draggedPlayer = null;
  draggedFrom = null;
}

function substitutePlayer(currentPlayer, newPlayer, teamId) {
  if (!newPlayer || !currentPlayer) {
    console.error(
      `Invalid players: currentPlayer=${currentPlayer}, newPlayer=${newPlayer}`
    );
    return;
  }
  const normalizedCurrentPlayer = currentPlayer.trim();
  const normalizedNewPlayer = newPlayer.trim();

  if (teamId === "teamA") {
    const index = window.teamA.indexOf(normalizedCurrentPlayer);
    if (index === -1) {
      console.error(`Player ${normalizedCurrentPlayer} not found in teamA`);
      return;
    }
    if (window.teamB.includes(normalizedNewPlayer)) {
      const newIndex = window.teamB.indexOf(normalizedNewPlayer);
      window.teamA[index] = normalizedNewPlayer;
      window.teamB[newIndex] = normalizedCurrentPlayer;
    } else if (window.nextTeams.flat().includes(normalizedNewPlayer)) {
      let found = false;
      for (let i = 0; i < window.nextTeams.length; i++) {
        const newIndex = window.nextTeams[i].indexOf(normalizedNewPlayer);
        if (newIndex !== -1) {
          window.nextTeams[i][newIndex] = normalizedCurrentPlayer;
          window.teamA[index] = normalizedNewPlayer;
          found = true;
          break;
        }
      }
      if (!found) {
        console.error(`Player ${normalizedNewPlayer} not found in nextTeams`);
        return;
      }
    } else {
      console.error(`Player ${normalizedNewPlayer} not found in any team`);
      return;
    }
  } else if (teamId === "teamB") {
    const index = window.teamB.indexOf(normalizedCurrentPlayer);
    if (index === -1) {
      console.error(`Player ${normalizedCurrentPlayer} not found in teamB`);
      return;
    }
    if (window.teamA.includes(normalizedNewPlayer)) {
      const newIndex = window.teamA.indexOf(normalizedNewPlayer);
      window.teamB[index] = normalizedNewPlayer;
      window.teamA[newIndex] = normalizedCurrentPlayer;
    } else if (window.nextTeams.flat().includes(normalizedNewPlayer)) {
      let found = false;
      for (let i = 0; i < window.nextTeams.length; i++) {
        const newIndex = window.nextTeams[i].indexOf(normalizedNewPlayer);
        if (newIndex !== -1) {
          window.nextTeams[i][newIndex] = normalizedCurrentPlayer;
          window.teamB[index] = normalizedNewPlayer;
          found = true;
          break;
        }
      }
      if (!found) {
        console.error(`Player ${normalizedNewPlayer} not found in nextTeams`);
        return;
      }
    } else {
      console.error(`Player ${normalizedNewPlayer} not found in any team`);
      return;
    }
  } else if (teamId.startsWith("nextTeam")) {
    const teamIndex = parseInt(teamId.replace("nextTeam", ""), 10);
    if (teamIndex >= window.nextTeams.length || teamIndex < 0) {
      console.error(`Invalid team index: ${teamIndex}`);
      return;
    }
    const index = window.nextTeams[teamIndex].indexOf(normalizedCurrentPlayer);
    if (index === -1) {
      console.error(
        `Player ${normalizedCurrentPlayer} not found in nextTeam${teamIndex}`
      );
      return;
    }
    if (window.teamA.includes(normalizedNewPlayer)) {
      const newIndex = window.teamA.indexOf(normalizedNewPlayer);
      window.nextTeams[teamIndex][index] = normalizedNewPlayer;
      window.teamA[newIndex] = normalizedCurrentPlayer;
    } else if (window.teamB.includes(normalizedNewPlayer)) {
      const newIndex = window.teamB.indexOf(normalizedNewPlayer);
      window.nextTeams[teamIndex][index] = normalizedNewPlayer;
      window.teamB[newIndex] = normalizedCurrentPlayer;
    } else if (window.nextTeams.flat().includes(normalizedNewPlayer)) {
      for (let i = 0; i < window.nextTeams.length; i++) {
        if (i === teamIndex) continue;
        const newIndex = window.nextTeams[i].indexOf(normalizedNewPlayer);
        if (newIndex !== -1) {
          window.nextTeams[i][newIndex] = normalizedCurrentPlayer;
          window.nextTeams[teamIndex][index] = normalizedNewPlayer;
          break;
        }
      }
    } else {
      console.error(`Player ${normalizedNewPlayer} not found in any team`);
      return;
    }
  }
  updateTeamsDisplay();
}

function deletePlayer(player, teamId) {
  const normalizedPlayer = player.trim();

  if (teamId === "teamA") {
    const index = window.teamA.indexOf(normalizedPlayer);
    if (index === -1) {
      console.error(`Player ${normalizedPlayer} not found in teamA`);
      return;
    }
    let replacementPlayer = null;
    if (window.nextTeams.length > 0) {
      const lastTeam = window.nextTeams[window.nextTeams.length - 1];
      if (lastTeam.length > 0) {
        replacementPlayer = lastTeam.pop();
        if (lastTeam.length === 0) {
          window.nextTeams.pop();
        }
      }
    }
    if (window.teamA.length > 1 || replacementPlayer) {
      window.teamA.splice(index, 1);
      if (replacementPlayer) {
        window.teamA.push(replacementPlayer);
      }
      window.players = window.players.filter((p) => p !== normalizedPlayer);
    } else {
      alert(
        "Não é possível remover o último jogador do Time A sem um substituto."
      );
      return;
    }
  } else if (teamId === "teamB") {
    const index = window.teamB.indexOf(normalizedPlayer);
    if (index === -1) {
      console.error(`Player ${normalizedPlayer} not found in teamB`);
      return;
    }
    let replacementPlayer = null;
    if (window.nextTeams.length > 0) {
      const lastTeam = window.nextTeams[window.nextTeams.length - 1];
      if (lastTeam.length > 0) {
        replacementPlayer = lastTeam.pop();
        if (lastTeam.length === 0) {
          window.nextTeams.pop();
        }
      }
    }
    if (window.teamB.length > 1 || replacementPlayer) {
      window.teamB.splice(index, 1);
      if (replacementPlayer) {
        window.teamB.push(replacementPlayer);
      }
      window.players = window.players.filter((p) => p !== normalizedPlayer);
    } else {
      alert(
        "Não é possível remover o último jogador do Time B sem um substituto."
      );
      return;
    }
  } else if (teamId.startsWith("nextTeam")) {
    const teamIndex = parseInt(teamId.replace("nextTeam", ""), 10);
    if (teamIndex >= window.nextTeams.length || teamIndex < 0) {
      console.error(`Invalid team index: ${teamIndex}`);
      return;
    }
    const index = window.nextTeams[teamIndex].indexOf(normalizedPlayer);
    if (index === -1) {
      console.error(
        `Player ${normalizedPlayer} not found in nextTeam${teamIndex}`
      );
      return;
    }
    window.nextTeams[teamIndex].splice(index, 1);
    window.players = window.players.filter((p) => p !== normalizedPlayer);
    if (window.nextTeams[teamIndex].length === 0) {
      window.nextTeams.splice(teamIndex, 1);
    }
  }
  updateTeamsDisplay();
}

function startMatch() {
  window.scoreA = 0;
  window.scoreB = 0;
  window.timer = 600;
  window.goalScorers = [];
  updateTeamsDisplay();
  updateTimerDisplay();
  if (window.timerInterval) clearInterval(window.timerInterval);
  window.timerInterval = setInterval(() => {
    window.timer--;
    updateTimerDisplay();
    if (window.timer <= 0) endMatch();
  }, 1000);
  window.timerRunning = true;
}

function pauseTimer() {
  if (window.timerInterval) {
    clearInterval(window.timerInterval);
    window.timerInterval = null;
    window.timerRunning = false;
  }
}

function startTimer() {
  if (!window.timerInterval) {
    window.timerInterval = setInterval(() => {
      window.timer--;
      updateTimerDisplay();
      if (window.timer <= 0) endMatch();
    }, 1000);
    window.timerRunning = true;
  }
}

function togglePause() {
  if (window.timerRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
  saveState();
}

function updateTimerDisplay() {
  const minutes = Math.floor(window.timer / 60);
  const seconds = window.timer % 60;
  document.getElementById("timer").textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
  const progressBar = document.getElementById("timerProgress");
  const percentage = (window.timer / 600) * 100;
  progressBar.style.width = `${percentage}%`;
  progressBar.setAttribute("aria-valuenow", percentage);
  if (window.timer > 300) {
    progressBar.className = "progress-bar bg-success";
  } else if (window.timer > 120) {
    progressBar.className = "progress-bar bg-primary";
  } else if (window.timer > 60) {
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
  if (team === "A") window.scoreA++;
  else window.scoreB++;
  window.goalScorers.push(scorer);

  const baseScorerName = scorer.split(" (")[0];
  const now = new Date();
  const brasiliaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const formattedDateTime = brasiliaTime
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  fetch(
    `players.php?action=addGoal&name=${encodeURIComponent(
      baseScorerName
    )}&datetime=${encodeURIComponent(formattedDateTime)}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        console.error("Erro ao salvar gol:", data.error);
      }
    })
    .catch((error) => console.error("Erro na requisição:", error));

  updateTeamsDisplay();
  if (
    Math.abs(window.scoreA - window.scoreB) >= 2 ||
    window.scoreA >= 2 ||
    window.scoreB >= 2
  ) {
    endMatch();
  }
  saveState();
}

function endMatch() {
  clearInterval(window.timerInterval);
  let winner, loser;
  if (
    window.scoreA > window.scoreB ||
    (window.scoreA === window.scoreB && window.lastWinner === "A" && window.nextTeams.length < 2)
  ) {
    winner = [...window.teamA];
    loser = [...window.teamB];
    window.lastWinner = "A";
  } else if (
    window.scoreB > window.scoreA ||
    (window.scoreA === window.scoreB && window.lastWinner === "B" && window.nextTeams.length < 2)
  ) {
    winner = [...window.teamB];
    loser = [...window.teamA];
    window.lastWinner = "B";
  } else if (window.scoreA === window.scoreB && window.nextTeams.length >= 2) {
    winner = [...window.teamA];
    loser = [...window.teamB];
    window.lastWinner = "A";
  } else {
    winner = [...window.teamA];
    loser = [...window.teamB];
    window.lastWinner = "A";
  }

  window.matchHistory.push({
    teamA: [...window.teamA],
    teamB: [...window.teamB],
    scoreA: window.scoreA,
    scoreB: window.scoreB,
    winner: window.lastWinner,
    goalScorers: [...window.goalScorers],
  });

  const resultModal = document.getElementById("endMatchModal");
  if (resultModal) {
    const modalInstance = new bootstrap.Modal(resultModal);
    const scorersList =
      window.goalScorers.length > 0
        ? `<br/><h6>Marcadores:</h6><ul>${window.goalScorers
            .map((scorer) => `<li>${scorer}</li>`)
            .join("")}</ul>`
        : "<p>Nenhum gol marcado.</p>";
    document.getElementById("matchResult").innerHTML = `
      <strong class="text-primary fs-5">Vencedor: Time ${window.lastWinner}</strong><br/>
      <br/>Placar: Time A ${window.scoreA} x ${window.scoreB} Time B<br/>
      <br/>Time A: ${window.teamA.join(", ")}<br/>
      Time B: ${window.teamB.join(", ")}<br/>
      ${scorersList}
    `;
    const audio = new Audio("aviso.mp3");
    audio.play().catch((error) => console.error("Error playing sound:", error));
    modalInstance.show();
  } else {
    console.error("Modal element #endMatchModal not found.");
  }

  let nextTeam = window.nextTeams.length > 0 ? window.nextTeams.shift() : [];
  let newTeam = nextTeam.slice(0, 4);
  const playersNeeded = 4 - newTeam.length;
  if (playersNeeded > 0 && loser.length > 0) {
    const shuffledLosers = shuffleArray([...loser]);
    const completingPlayers = shuffledLosers.slice(0, playersNeeded);
    newTeam = [...newTeam, ...completingPlayers];
    loser = loser.filter(p => !completingPlayers.includes(p));
  }

  if (window.lastWinner === "A") {
    window.teamA = [...winner];
    window.teamB = [...newTeam];
  } else {
    window.teamA = [...newTeam];
    window.teamB = [...winner];
  }

  if (loser.length > 0) {
    const newNextTeam = loser.slice(0, 4);
    if (newNextTeam.length > 0) {
      window.nextTeams.push(newNextTeam);
    }
  }

  window.goalScorers = [];
  updateTeamsDisplay();
  window.scoreA = 0;
  window.scoreB = 0;
  window.timer = 600;
  updateTimerDisplay();
}

function addPlayerDuringMatch() {
  const name = document.getElementById("newPlayerName").value.trim();
  if (name && !window.players.some((p) => p.split(" (")[0] === name)) {
    const numberedName = `${name} (${window.players.length + 1})`;
    window.players.push(numberedName);
    let added = false;

    // Procurar a última próxima com menos de 4 jogadores, começando do final
    for (let i = window.nextTeams.length - 1; i >= 0; i--) {
      if (window.nextTeams[i].length < 4) {
        window.nextTeams[i].push(numberedName);
        added = true;
        break;
      }
    }

    // Se todas as próximas já têm 4 jogadores, criar uma nova próxima
    if (!added) {
      window.nextTeams.push([numberedName]);
    }

    // Verificar e corrigir se algum time ultrapassou 4 jogadores (deveria ser bloqueado antes, mas como segurança)
    window.nextTeams.forEach((team, index) => {
      if (team.length > 4) {
        const excess = team.splice(4);
        if (window.nextTeams[index + 1]) {
          window.nextTeams[index + 1] = [...excess, ...window.nextTeams[index + 1]];
        } else {
          window.nextTeams.push(excess);
        }
      }
    });

    updateTeamsDisplay();
    document.getElementById("newPlayerName").value = "";
    bootstrap.Modal.getInstance(
      document.getElementById("addPlayerModal")
    ).hide();
    saveState();
  }
}

function endDay() {
  const statsDiv = document.getElementById("generalStats");
  statsDiv.innerHTML = `
    <h4>Estatísticas do Dia</h4>
    <p>Partidas jogadas: ${window.matchHistory.length}</p>
    <p>Times mais vitoriosos: ${
      window.lastWinner === "A" ? "Time A" : "Time B"
    }</p>
  `;
  showSection("stats");
}

function setTimerTo10() {
  window.timer = 600; // 10 minutos
  updateTimerDisplay();
  saveState();
}

function setTimerTo8() {
  window.timer = 480; // 8 minutos
  updateTimerDisplay();
  saveState();
}