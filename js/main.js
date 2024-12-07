import { movePlayerInBackend, getGameInfo, deletePlayer } from './api.js';
import { messages } from './messages.js';

let imageMap = {}; 

document.addEventListener("DOMContentLoaded", () => {
    const gameForm = document.getElementById("game-form");
    const output = document.getElementById("output");
    const gameContainer = document.getElementById("game-container");
    const playerContainer = document.getElementById("player-container");
    const savePlayerButton = document.getElementById("savePlayer");
    const testButton = document.getElementById("testGameInfo");
    const gameOutput = document.getElementById("gameInfoOutput");
    const deletePlayerInput = document.getElementById("deletePlayerInput");
    const confirmDeletePlayerButton = document.getElementById("confirmDeletePlayerButton");
    const deletePlayerModal = document.getElementById("deletePlayerModal");

    let selectedImageSrc = null;

    const gameState = {
        width: 0,
        height: 0,
        players: [],
    };

    fetch("./dataImages.json")
        .then((response) => response.json())
        .then((data) => {
            data.players.forEach((player) => {
                imageMap[player.name] = player.image;

                const col = document.createElement("div");
                col.className = "col-4 modal-player-col mb-3";
    
                const card = `
                    <div class="card bg-dark-gray text-white player-card selectable" data-src="${player.image}" data-username="${player.name}">
                        <img 
                            src="${player.image}" 
                            class="card-img-top card-modal-img img-thumbnail" 
                            alt="${player.name}" 
                        />
                        <div class="card-body text-center p-1">
                            <h6 class="card-title p-1">${player.name}</h6>
                        </div>
                    </div>
                `;
    
                col.innerHTML = card;
                playerContainer.appendChild(col);
            });
    
            document.querySelectorAll(".selectable").forEach((card) => {
                card.addEventListener("click", () => {
                    document.querySelectorAll(".selectable").forEach((c) => c.classList.remove("selected"));
                    card.classList.add("selected");
                    selectedImageSrc = card.getAttribute("data-src");
                    selectedUsername = card.getAttribute("data-username"); 
                });
            });
        })
              
        .catch((error) => console.error("Error al cargar los datos:", error));

            savePlayerButton.addEventListener("click", async () => {
                
                if (!selectedImageSrc) {
                    showError(messages.errors.missingPlayerImage);
                    return;
                }
                const username = document.getElementById("player-username").value.trim();
                if (!username) {
                    showError(messages.errors.missingPlayerName);
                    return;
                }    
            const modal = bootstrap.Modal.getInstance(document.getElementById("choosePlayerModal"));
            modal.hide();

            try {
                output.textContent = `Agregando personaje ${username}...`;
                const playerResult = await addPlayer(username);
                const position = playerResult.position;
                const selectedImageSrc = imageMap[username]
                gameState.players.push({ username, position, imageSrc: selectedImageSrc });

                addPlayerToGrid(username, position.row, position.column, selectedImageSrc);
                showSuccess(`${messages.success.addPlayer} (${position.row}, ${position.column}).`);

            } catch (error) {
                showError(messages.errors.addPlayer)
            }
        });

        gameForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const width = parseInt(document.getElementById("game-width").value, 10);
        const height = parseInt(document.getElementById("game-height").value, 10);
        const username = document.getElementById("player-username").value.trim();
        const row = parseInt(document.getElementById("move-row").value, 10);
        const column = parseInt(document.getElementById("move-column").value, 10);

        if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
            output.textContent = "Creando el juego...";
            createGame(width, height)
            .then(() => {
            showSuccess(messages.success.textContent)
        })
        .catch((error) => {
            output.textContent = `Error al crear el juego: ${error.message}`;
        });
        } else if (username && !selectedImageSrc) {
            output.textContent = "Por favor selecciona un personaje en el modal.";
        } else if (username && isNaN(row) && isNaN(column)) {
            output.textContent = `Agregando personaje ${username}...`;
            addPlayer(username, selectedImageSrc)
            .then((playerResult) => {
            const position = playerResult.position;

        gameState.players.push({ username, position, imageSrc: selectedImageSrc });
            addPlayerToGrid(username, position.row, position.column, selectedImageSrc);
            output.textContent += `\nPersonaje ${username} agregado en (${position.row}, ${position.column}).`;
        })
            .catch((error) => {
            output.textContent = `Error al agregar personaje: ${error.message}`;
        });
        } else if (username && !isNaN(row) && !isNaN(column)) {
            output.textContent = `Moviendo personaje ${username} a (${row}, ${column})...`;
        movePlayer(username, { row, column })
            .then(() => {
            updatePlayerPosition(username, row, column, selectedImageSrc);
            output.textContent += `\nPersonaje ${username} movido a (${row}, ${column}).`;
        })
            .catch((error) => {
            output.textContent = `Error al mover personaje: ${error.message}`;
        });
        } else {
        output.textContent = "Por favor, completa correctamente los campos.";
        }
        });

        confirmDeletePlayerButton.addEventListener("click", async () => {
            const username = deletePlayerInput.value.trim();
    
            if (!username) {
                alert("Por favor, ingresa el nombre del jugador.");
                return;
            }
    
            try {
                confirmDeletePlayerButton.textContent = "Eliminando...";
                confirmDeletePlayerButton.disabled = true;
    
                const response = await deletePlayer(username);
    
                alert(`Jugador eliminado: ${response.message}`);
                deletePlayerInput.value = ""; // Limpiar el input
                const bootstrapModal = bootstrap.Modal.getInstance(deletePlayerModal);
                bootstrapModal.hide(); // Cerrar el modal
            } catch (error) {
                alert(`Error al eliminar el jugador: ${error.message}`);
                console.error("Error al eliminar jugador:", error);
            } finally {
                confirmDeletePlayerButton.textContent = "Eliminar";
                confirmDeletePlayerButton.disabled = false;
            }    
        });
        

    function createGame(width, height) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    gameState.width = width;
                    gameState.height = height;
                    gameState.players = [];
                    createGrid(width, height);
                    resolve();
                } catch (error) {
                    reject(new Error("Error al crear el juego."));
                }
            }, 500);
        });
    }

    function addPlayer(username, imageSrc) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const position = {
                        row: Math.floor(Math.random() * gameState.height),
                        column: Math.floor(Math.random() * gameState.width),
                    };
                    resolve({ username, position, imageSrc });
                } catch (error) {
                    reject(new Error("Error al agregar el personaje."));
                }
            }, 500);
        });
    }

    async function movePlayer(username, row, col) {
        try {
            const newPosition = await movePlayerInBackend(username, { row, col });
            const existingPlayer = gameState.players.find((player) => player.username === username);
    
            if (!existingPlayer) {
                throw new Error(`Personaje ${username} no encontrado.`);
            }
    
            existingPlayer.position = newPosition.position;
            updatePlayerPosition(username, newPosition.position.row, newPosition.position.column, existingPlayer.imageSrc);

            console.log(`Personaje ${username} movido a (${newPosition.position.row}, ${newPosition.position.column}).`);
        } catch (error) {
            console.error("Error al mover el personaje:", error);
        }
    }
    
        function movePlayerHandler(username, row, col) {
            return new Promise(async (resolve, reject) => {
                try {
                    const newPosition = await movePlayerInBackend(username, { row, col });
                    const playerIndex = gameState.players.findIndex((player) => player.username === username);
        
                    if (playerIndex !== -1) {
                        gameState.players[playerIndex].position = newPosition.position;
                    }
        
                    updatePlayerPosition(username, newPosition.position.row, newPosition.position.column, gameState.players[playerIndex].imageSrc);
                    console.log(`Jugador ${username} movido a (${newPosition.position.row}, ${newPosition.position.column}).`);
                    resolve();
                } catch (error) {
                    console.error("Error al mover el personaje:", error);
                    reject(error);
                }
            });
        }
   
    function createGrid(width, height) {
        gameContainer.style.display = "inline-grid";
        gameContainer.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
        gameContainer.style.gridTemplateRows = `repeat(${height}, 1fr)`;
        gameContainer.innerHTML = "";

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;

                cell.addEventListener("dragover", (e) => {
                    e.preventDefault(); 
                    cell.classList.add("drag-over"); 
                });

                cell.addEventListener("dragleave", () => {
                    cell.classList.remove("drag-over");
                });

                cell.addEventListener("drop", async (e) => {
                    e.preventDefault();
                    cell.classList.remove("drag-over");
                    const username = e.dataTransfer.getData("text/plain");
                    const player = gameState.players.find((player) => player.username === username);
                    if (!player) {
                        console.error(`Jugador no encontrado: ${username}`);
                        output.textContent = `Jugador no encontrado: ${username}`;
                        return;
                    }
                
                    const newRow = parseInt(cell.dataset.row, 10);
                    const newCol = parseInt(cell.dataset.col, 10);
                
                    try {
                        console.log(`Intentando mover a ${username} a (${newRow}, ${newCol})`);
                        await movePlayerHandler(username, newRow, newCol);
                        
                        output.textContent = `Jugador ${username} movido a (${newRow}, ${newCol}).`;
                    } catch (error) {
                        console.error("Error al mover el personaje:", error);
                        output.textContent = `Error al mover el personaje: ${error.message}`;
                    }
            });
    
                gameContainer.appendChild(cell);
            }
        }
    }

    
    function addPlayerToGrid(username, row, col, imageSrc) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            const img = document.createElement("img");
            img.src = imageSrc;
            img.alt = username;
            img.title = username;
            img.className = "player-image";
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover";
            img.draggable = true; 

            img.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", username); 
            });    
            cell.appendChild(img);
        }
    };
        
    function updatePlayerPosition(username, row, col, imageSrc) {
        const currentCell = document.querySelector(`.cell img[alt="${username}"]`);
        if (currentCell) {
            const parentCell = currentCell.parentElement;
            parentCell.removeChild(currentCell);
        }

        const newCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (newCell) {
            const img = document.createElement("img");
            img.src = imageSrc;
            img.alt = username;
            img.title = username;
            img.className = "player-image";
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover";
            img.draggable = true;

            img.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", username);
            });

            newCell.appendChild(img);
        }
    };

    function handleGameInfoClick() {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("Obteniendo información del juego...");
                const gameInfo = await getGameInfo();
                console.log("Información del juego obtenida con éxito:", gameInfo);
    
                let outputHTML = `
                    <div class="card mb-3">
                            
                `;
    
            gameInfo.players.forEach((player, index) => {
                const playerImage = gameState.players.find(p => p.username === player.username)?.imageSrc || "./images/default-cardImage.png";
                outputHTML += `
                    <img 
                    src="${playerImage}" 
                    alt="${player.username}" 
                    class="card-player-image bd-placeholder-img card-img-top" width="441px" height="259.27" 
                    />
                    <div class="card-body card-player-data">
                    <h1 class="card-title card-player-data">Player <strong>${player.username}</strong></h5>
                    <h6 class="card-subtitle mb-2 card-player-data">Número Actual de Jugadores: ${gameInfo.currentPlayers}</h6>
                    <div class="players-info">
                    <p class="text-left">Posición Actual:</p> (${player.position.row}, ${player.position.column})
                    <p class="text-left">Rutas Recorridas:</p>
                        <ul class="list-group">
                            ${player.positions.map((pos, posIndex) => `
                                <li class="list-group-item bg-dark-gray text-white border-0">Movimiento ${posIndex + 1}: (${pos.row}, ${pos.column})</li>
                            `).join("")}
                        </ul>
                `;
            });
    
            outputHTML += `
                        </div>
                    </div>
                </div>
            `;
    
            gameOutput.innerHTML = outputHTML;
            resolve();
            } catch (error) {
                console.error("Error al obtener la información del juego:", error.message);
                gameOutput.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
                reject(error);
            }
        });
    }
    
    testButton.addEventListener("click", () => {
        if (gameState.players.length === 0) {
            showError(messages.errors.missingAddPlayer);
            return;
        }
        handleGameInfoClick()
            .then(() => {
                console.log("Información del juego mostrada con éxito.");
            })
            .catch((error) => {
                console.error("Error al manejar el clic para información del juego:", error.message);
            });
    });

    function showSuccess(message) {
        showMessage(message, "success");
    }
    
    function showError(message) {
        showMessage(message, "danger");
    }
    
    function showMessage(message, type) {
        const output = document.getElementById("output");
        output.className = `alert alert-${type}`;
        output.textContent = message;
    
        setTimeout(() => {
            output.textContent = "";
            output.className = "";
        }, 5000);
    }

});



