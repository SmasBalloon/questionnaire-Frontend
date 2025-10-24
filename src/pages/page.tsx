import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import type { Player } from "../utils/type";

export default function Room() {
  const [pseudo, setPseudo] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [connected, setConnected] = useState(false);

  // Enregistrer TOUS les écouteurs dès le montage du composant
  useEffect(() => {
    console.log("🎧 Enregistrement des écouteurs Socket.IO");

    socket.on("connect", () => {
      console.log("✅ Connecté à Socket.IO", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Déconnecté de Socket.IO");
    });

    socket.on("room_update", (data: Player[]) => {
      console.log("📥 Mise à jour de la room:", data);
      setPlayers(data);
    });

    // Nettoyage à la destruction du composant
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("room_update");
    };
  }, []); // Exécuté une seule fois au montage

  // Rejoindre la salle
  const handleJoin = () => {
    if (!pseudo.trim() || !roomCode.trim()) {
      alert("Merci de remplir tous les champs !");
      return;
    }
    console.log("🚀 Tentative de rejoindre la salle:", { pseudo, roomCode });
    console.log("🔌 Socket connecté ?", socket.connected);
    
    // S'assurer que le socket est connecté avant d'envoyer
    if (!socket.connected) {
      console.log("⏳ Socket non connecté, connexion en cours...");
      socket.connect();
      socket.once("connect", () => {
        console.log("✅ Socket connecté, envoi de join_room");
        socket.emit("join_room", { pseudo, roomCode });
        setConnected(true);
      });
    } else {
      socket.emit("join_room", { pseudo, roomCode });
      setConnected(true);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem", fontFamily: "sans-serif" }}>
      {!connected ? (
        <div style={{ margin: "auto", maxWidth: 400 }}>
          <h2>🎮 Rejoindre une partie</h2>
          <input
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            placeholder="Ton pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
          />
          <input
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            placeholder="Code de salle (ex: ABC123)"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button
            onClick={handleJoin}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            🚀 Rejoindre
          </button>
        </div>
      ) : (
        <div>
          <h2>🧩 Salle : {roomCode}</h2>
          <p>Joueurs connectés : {players.length}</p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {players.map((p) => (
              <li key={p.id}>👤 {p.pseudo}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
