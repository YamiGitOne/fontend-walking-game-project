import { config } from './config.js';

    export async function createGame(width, height) {
        try {
            const response = await fetch(`${config.API_BASE_URL}${config.API_POST_GAME}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify({ width, height }),
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            return response.json(); 
        } catch (error) {
            console.error("Error al crear el juego:", error);
            throw error;
        }
    };

    export async function addPlayer(username) {
        try {
            const response = await fetch(`${config.API_BASE_URL}${config.API_POST_PLAYER}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            return response.json(); 
        } catch (error) {
            console.error("Error al agregar un nuevo jugador:", error);
            throw error; 
        }
    };

    export async function movePlayerInBackend(username, position) {
        try {
            const response = await fetch(`${config.API_BASE_URL}${config.API_PATCH_PLAYER}/${username}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify([
                    {
                        "operationType": 0,
                        "path": "/Position",
                        "op": "replace",
                        "from": "string",
                        "value": {
                            "Row": position.row,
                            "Column": position.column,
                        }
                    }
                ]),
            });

            if (!response.ok) {
                throw new Error(`Error al mover el jugador: ${response.status}`);
            }

            return response.json(); 
        } catch (error) {
            console.error("Error al mover el jugador:", error);
            throw error;
        }
    };

    export async function getPlayerDetails(username) {
        
        try {
            const response = await fetch(`${config.API_BASE_URL}${config.API_GET_PLAYER}?username=${encodeURIComponent(username)}`);
            if (!response.ok) {
                if (response.status === 404) { 
                    throw new Error(`El jugador "${username}" no existe.`);
                }
                throw new Error(`Error al obtener detalles del jugador: ${response.status}`);
            }
            return response.json(); 
        } catch (error) {
            console.error("Error en getPlayerDetails:", error);
            throw error;
        }
    };

    export async function getGameInfo() {
        try {
            const response = await fetch(`${config.API_BASE_URL}${config.API_GET_GAME}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                console.error("Detalles del error:", errorResponse);
                throw new Error(`Error: ${response.status} - ${errorResponse.message || "Error al obtener información del juego"}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error en getGameInfo:", error);
            throw error;
        }
    };

    export async function deletePlayer(username) {
        try {
            const response = await fetch(`${config.API_BASE_URL}${config.API_DELETE_PLAYER}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                console.error("Detalles del error:", errorResponse);
                throw new Error(`Error al eliminar el jugador: ${response.status}`);
            }

            return await response.json(); 
        } catch (error) {
            console.error("Error en deletePlayer:", error);
            throw error;
        }
    };














