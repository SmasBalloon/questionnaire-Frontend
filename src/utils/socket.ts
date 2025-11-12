import { io } from "socket.io-client";

// Utiliser la variable d'environnement, avec fallback pour le dev
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000,
  transports: ["polling", "websocket"], // Essayer polling d'abord
});

console.log("🔧 Tentative de connexion Socket.IO à:", SOCKET_URL);
console.log("🌐 Origin actuel:", window.location.origin);

// Logs de connexion
socket.on("connect", () => {
  console.log("✅ Socket.IO connecté avec l'ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ Erreur de connexion Socket.IO:", error.message, error);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Socket.IO déconnecté:", reason);
});
