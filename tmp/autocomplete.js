document.addEventListener("DOMContentLoaded", () => {
  // Garantir que as funções de jogo estejam disponíveis
  if (typeof window.updatePlayerList !== "function" || typeof window.updateTeamsDisplay !== "function") {
    console.error("Dependências de jogo.js não carregadas. Verifique a ordem dos scripts.");
    return;
  }

  const input = document.getElementById("playerName");
  const debug = document.getElementById("playerDebug");
  const list = document.getElementById("autocompleteList");
  const newPlayerInput = document.getElementById("newPlayerName");
  const modalAutocompleteList = document.createElement("ul");
  modalAutocompleteList.id = "modalAutocompleteList";
  modalAutocompleteList.className = "list-group";
  newPlayerInput.parentElement.appendChild(modalAutocompleteList);

  let suggestions = [];
  let modalSuggestions = [];

  // Autocomplete para o campo principal
  input.addEventListener("input", () => {
    const term = input.value.trim();
    list.innerHTML = "";
    if (term.length >= 1) {
      fetch(`players.php?action=autocomplete&name=${encodeURIComponent(term)}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Resposta do servidor (principal):", data);
          suggestions = data.players || [];
          debug.innerHTML = `Registros encontrados: ${data.count}`;
          if (suggestions.length > 0) {
            suggestions.forEach((name) => {
              const li = document.createElement("li");
              li.textContent = name;
              li.className = "list-group-item";
              li.onclick = (event) => {
                event.preventDefault();
                const numberedName = `${name} (${(window.players || []).length + 1})`;
                console.log("Tentando adicionar:", numberedName, "Players atual:", window.players);
                if (!window.players || !window.players.some((p) => p.split(" (")[0] === name)) {
                  if (!window.players) window.players = [];
                  window.players.push(numberedName);
                  console.log("Após adição:", window.players);
                  window.updatePlayerList();
                  console.log("Lista atualizada no DOM");
                  fetch(`players.php?action=add&name=${encodeURIComponent(name)}`)
                    .then((res) => res.json())
                    .then((data) => {
                      if (!data.success) {
                        console.error("Erro ao adicionar jogador:", data.error);
                      } else {
                        console.log("Jogador adicionado com sucesso:", data);
                      }
                    })
                    .catch((error) => console.error("Erro na requisição:", error));
                  window.saveState();
                } else {
                  console.log("Jogador já existe, não adicionado:", name);
                }
                input.value = "";
                list.innerHTML = "";
              };
              list.appendChild(li);
            });
          } else {
            debug.innerHTML = "Nenhum jogador encontrado";
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar jogadores (principal):", error);
          debug.innerHTML = "Erro ao buscar jogadores";
        });
    } else {
      debug.innerHTML = "";
      list.innerHTML = "";
    }
  });

  // Fecha a lista ao clicar fora
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#autocompleteList") && e.target !== input) {
      list.innerHTML = "";
    }
  });

  // Autocomplete para o modal
  newPlayerInput.addEventListener("input", () => {
    const term = newPlayerInput.value.trim();
    modalAutocompleteList.innerHTML = "";
    if (term.length >= 1) {
      fetch(`players.php?action=autocomplete&name=${encodeURIComponent(term)}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Resposta do servidor (modal):", data);
          modalSuggestions = data.players || [];
          if (modalSuggestions.length > 0) {
            modalSuggestions.forEach((name) => {
              const li = document.createElement("li");
              li.textContent = name;
              li.className = "list-group-item";
              li.onclick = (event) => {
                event.preventDefault();
                const numberedName = `${name} (${(window.players || []).length + 1})`;
                console.log("Tentando adicionar no modal:", numberedName, "Players atual:", window.players);
                if (!window.players || !window.players.some((p) => p.split(" (")[0] === name)) {
                  if (!window.players) window.players = [];
                  window.players.push(numberedName);
                  let added = false;
                  for (let i = 0; i < (window.nextTeams || []).length; i++) {
                    if ((window.nextTeams[i] || []).length < 5) {
                      window.nextTeams[i].push(numberedName);
                      added = true;
                      break;
                    }
                  }
                  if (!added && !window.nextTeams) window.nextTeams = [];
                  if (!added) window.nextTeams.push([numberedName]);
                  window.updateTeamsDisplay();
                  console.log("Times atualizados no DOM");
                  fetch(`players.php?action=add&name=${encodeURIComponent(name)}`)
                    .then((res) => res.json())
                    .then((data) => {
                      if (!data.success) {
                        console.error("Erro ao adicionar jogador:", data.error);
                      } else {
                        console.log("Jogador adicionado com sucesso:", data);
                      }
                    })
                    .catch((error) => console.error("Erro na requisição:", error));
                  window.saveState();
                } else {
                  console.log("Jogador já existe no modal, não adicionado:", name);
                }
                newPlayerInput.value = "";
                modalAutocompleteList.innerHTML = "";
                bootstrap.Modal.getInstance(document.getElementById("addPlayerModal")).hide();
              };
              modalAutocompleteList.appendChild(li);
            });
          } else {
            console.log("Nenhuma sugestão encontrada no modal");
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar jogadores (modal):", error);
        });
    }
  });

  // Fecha a lista do modal ao clicar fora
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#modalAutocompleteList") && e.target !== newPlayerInput) {
      modalAutocompleteList.innerHTML = "";
    }
  });

  window.addPlayer = function () {
    const name = input.value.trim();
    if (name === "" || (window.players || []).some((p) => p.split(" (")[0] === name)) return;

    const numberedName = `${name} (${(window.players || []).length + 1})`;
    if (!window.players) window.players = [];
    window.players.push(numberedName);
    window.updatePlayerList();
    fetch(`players.php?action=add&name=${encodeURIComponent(name)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          console.error("Erro ao adicionar jogador:", data.error);
        }
      })
      .catch((error) => console.error("Erro na requisição:", error));

    input.value = "";
    list.innerHTML = "";
    debug.innerHTML = "";
    window.saveState();
  };

  window.addPlayerDuringMatch = function () {
    const name = newPlayerInput.value.trim();
    if (name && !(window.players || []).some((p) => p.split(" (")[0] === name)) {
      const numberedName = `${name} (${(window.players || []).length + 1})`;
      if (!window.players) window.players = [];
      window.players.push(numberedName);
      let added = false;
      if (!window.nextTeams) window.nextTeams = [];
      for (let i = 0; i < window.nextTeams.length; i++) {
        if ((window.nextTeams[i] || []).length < 5) {
          window.nextTeams[i].push(numberedName);
          added = true;
          break;
        }
      }
      if (!added) window.nextTeams.push([numberedName]);
      window.updateTeamsDisplay();
      fetch(`players.php?action=add&name=${encodeURIComponent(name)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            console.error("Erro ao adicionar jogador:", data.error);
          }
        })
        .catch((error) => console.error("Erro na requisição:", error));
      newPlayerInput.value = "";
      modalAutocompleteList.innerHTML = "";
      bootstrap.Modal.getInstance(document.getElementById("addPlayerModal")).hide();
      window.saveState();
    }
  };
});