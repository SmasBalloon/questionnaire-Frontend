import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../utils/socket";
import type { Player, PendingAnswer } from "../utils/type";

export default function PlayQuizHost() {
  const { id } = useParams<{ id: string }>();
  const [quizTitle, setQuizTitle] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [timer, setTimer] = useState(0);
  const [pendingAnswers, setPendingAnswers] = useState<PendingAnswer[]>([]);

  // Générer un code de room aléatoire
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Charger les infos du quiz et créer la room
  useEffect(() => {
    const fetchQuizInfo = async () => {
      try {
        // Charger les infos basiques du quiz
        const response = await fetch(`/api/quiz/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setQuizTitle(data.title);
        
        // Charger les questions du quiz
        const questionsResponse = await fetch(`/api/quiz/${id}/questions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (questionsResponse.ok) {
          const quizData = await questionsResponse.json();
          setQuestions(quizData.questions || []);
        }
        
        // Générer et stocker le code de la room
        const code = generateRoomCode();
        setRoomCode(code);
        
        // S'assurer que le socket est connecté avant de créer la room
        const createRoom = () => {
          socket.emit("create_room", { roomCode: code, quizId: id });
        };

        if (socket.connected) {
          createRoom();
        } else {
          socket.connect();
          socket.once("connect", () => {
            createRoom();
          });
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement du quiz:", error);
      }
    };

    fetchQuizInfo();
  }, [id]);

  // Écouter les mises à jour de la room
  useEffect(() => {
    socket.on("room_update", (data: Player[]) => {
      setPlayers(data);
    });

    socket.on("scores_update", (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    socket.on("pending_answers_update", (answers: PendingAnswer[]) => {
      setPendingAnswers(answers);
    });

    socket.on("question_start", ({ questionIndex, question }: { questionIndex: number; question: any }) => {
      setCurrentQuestionIndex(questionIndex);
      setShowQuestion(true);
      setPendingAnswers([]);
      // Ajouter 10 secondes pour le temps de lecture côté hôte
      setTimer((question.timeLimit || 30) + 10);
    });

    return () => {
      socket.off("room_update");
      socket.off("scores_update");
      socket.off("pending_answers_update");
      socket.off("question_start");
    };
  }, []);

  // Timer pour les questions
  useEffect(() => {
    if (showQuestion && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Quand le timer atteint 0, afficher la bonne réponse
            setShowCorrectAnswer(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showQuestion, timer]);

  // Démarrer le jeu
  const handleStartGame = () => {
    if (players.length === 0) {
      alert("Attendez qu'au moins un joueur rejoigne !");
      return;
    }
    if (questions.length === 0) {
      alert("Aucune question disponible pour ce quiz !");
      return;
    }
    socket.emit("start_game", { roomCode, questions });
    setGameStarted(true);
  };

  // Passer à la question suivante
  const handleNextQuestion = () => {
    // Cacher la question et afficher le tableau des scores
    setShowQuestion(false);
    setShowCorrectAnswer(false);
    setShowScoreboard(true);
  };

  // Continuer vers la question suivante après le scoreboard
  const handleContinueToNextQuestion = () => {
    setShowScoreboard(false);
    setShowCorrectAnswer(false);
    setPendingAnswers([]);
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= questions.length) {
      alert("Quiz terminé !");
      return;
    }
    
    socket.emit("next_question", { roomCode, questionIndex: nextIndex, questions });
  };

  // Valider une réponse SHORT_ANSWER
  const handleValidateAnswer = (playerId: string, questionId: number, isCorrect: boolean) => {
    socket.emit("validate_answer", {
      roomCode,
      playerId,
      questionId,
      isCorrect
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 p-8">
      <div className="max-w-4xl mx-auto">
        {!gameStarted ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
              🎮 {quizTitle}
            </h1>
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 mb-8 text-center">
              <p className="text-white text-xl mb-4">
                Code de la salle
              </p>
              <div className="bg-white rounded-lg p-6 mb-4">
                <p className="text-6xl font-bold text-gray-800 tracking-widest">
                  {roomCode || "Chargement..."}
                </p>
              </div>
              <p className="text-white text-sm">
                Les joueurs peuvent rejoindre sur <strong>/join</strong>
              </p>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  👥 Joueurs connectés
                </h2>
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold">
                  {players.length}
                </span>
              </div>

              {players.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-xl">⏳ En attente de joueurs...</p>
                  <p className="text-sm mt-2">Partagez le code <strong>{roomCode}</strong></p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {players.map((player, index) => (
                    <div
                      key={player.id}
                      className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-4 flex items-center space-x-3 transform transition hover:scale-105"
                    >
                      <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="font-semibold text-gray-800">
                        {player.pseudo}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleStartGame}
              disabled={players.length === 0 || questions.length === 0}
              className={`w-full py-4 rounded-xl text-white font-bold text-xl transition ${
                players.length === 0 || questions.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 transform hover:scale-105"
              }`}
            >
              🚀 Démarrer le jeu {questions.length > 0 && `(${questions.length} questions)`}
            </button>
          </div>
        ) : showScoreboard ? (
          // Page de scores entre les questions
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-2">
              🏆 Classement
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Question {currentQuestionIndex + 1} / {questions.length}
            </p>

            <div className="space-y-4 mb-8">
              {players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-6 rounded-xl border-4 transition transform hover:scale-105 ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-500'
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-400'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-400 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                      </div>
                      <span className="text-2xl font-bold text-gray-800">
                        {player.pseudo}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-blue-600">
                        {player.score}
                      </span>
                      <span className="text-gray-600 text-lg ml-2">pts</span>
                    </div>
                  </div>
                ))}
            </div>

            <button
              onClick={handleContinueToNextQuestion}
              className="w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl transition transform hover:scale-105"
            >
              {currentQuestionIndex < questions.length - 1 ? '➡️  Question suivante' : '🏁 Voir le classement final'}
            </button>
          </div>
        ) : showQuestion && questions[currentQuestionIndex] ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Header avec timer */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-gray-600">
                Question {currentQuestionIndex + 1} / {questions.length}
              </div>
              <div className={`text-4xl font-bold ${timer <= 5 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                ⏱️ {timer}s
              </div>
            </div>

            {/* Question */}
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              {questions[currentQuestionIndex].questionText}
            </h2>

            {/* Type de question */}
            <div className="text-center mb-6">
              <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                {questions[currentQuestionIndex].type === "TRUE_FALSE" && "Vrai ou Faux"}
                {questions[currentQuestionIndex].type === "MULTIPLE_CHOICE" && "Choix unique"}
                {questions[currentQuestionIndex].type === "MULTIPLE_SELECT" && "Choix multiples"}
                {questions[currentQuestionIndex].type === "SHORT_ANSWER" && "Réponse courte"}
              </span>
            </div>

            {/* Réponses - Seulement si ce n'est pas TRUE_FALSE et SHORT_ANSWER */}
            {questions[currentQuestionIndex].type !== "TRUE_FALSE" && questions[currentQuestionIndex].type !== "SHORT_ANSWER" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {questions[currentQuestionIndex].answers?.map((answer: any, index: number) => (
                  <div
                    key={answer.id}
                    className={`p-6 rounded-xl border-4 transition-all ${
                      showCorrectAnswer && answer.isCorrect
                        ? 'border-green-500 bg-green-100 shadow-xl scale-105'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                        showCorrectAnswer && answer.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                      }`}>
                        {showCorrectAnswer && answer.isCorrect ? '✅' : String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-lg font-semibold text-gray-800">
                        {answer.answerText || questions[currentQuestionIndex].correctAnswerText}
                      </span>
                      {showCorrectAnswer && answer.isCorrect && (
                        <span className="ml-auto text-green-600 font-bold text-xl">
                          BONNE RÉPONSE
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : questions[currentQuestionIndex].type === "SHORT_ANSWER" ? (
              <div className="mb-8">
                {/* Afficher la réponse attendue seulement après le timer */}
                {showCorrectAnswer && (
                  <div className="bg-blue-50 border-4 border-blue-300 rounded-xl p-6 mb-6">
                    <p className="text-center text-blue-800 text-lg font-semibold">
                      📝 Réponse attendue : <span className="font-bold">{questions[currentQuestionIndex].correctAnswerText}</span>
                    </p>
                  </div>
                )}

                {/* Pendant le timer, afficher seulement un message d'attente */}
                {!showCorrectAnswer && (
                  <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-8 mb-6 text-center">
                    <div className="text-6xl mb-4">✍️</div>
                    <p className="text-orange-800 text-xl font-bold mb-2">
                      Les joueurs écrivent leurs réponses...
                    </p>
                    <p className="text-orange-600 text-sm">
                      Vous pourrez valider les réponses une fois le temps écoulé
                    </p>
                  </div>
                )}

                {/* Liste des réponses en attente de validation - visible seulement après le timer */}
                {showCorrectAnswer && pendingAnswers.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Réponses à valider ({pendingAnswers.length})
                    </h3>
                    {pendingAnswers.map((pending) => (
                      <div key={pending.playerId} className="bg-white border-4 border-yellow-300 rounded-xl p-4 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-lg text-gray-800">{pending.playerPseudo}</p>
                            <p className="text-gray-600 italic">"{pending.answerText}"</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Temps: {pending.responseTime.toFixed(1)}s • Points potentiels: {pending.potentialPoints}
                            </p>
                          </div>
                          <div className="flex gap-3 ml-4">
                            <button
                              onClick={() => handleValidateAnswer(pending.playerId, pending.questionId, true)}
                              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-lg transition-all hover:scale-105"
                            >
                              ✅ Correct
                            </button>
                            <button
                              onClick={() => handleValidateAnswer(pending.playerId, pending.questionId, false)}
                              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg transition-all hover:scale-105"
                            >
                              ❌ Incorrect
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : showCorrectAnswer && pendingAnswers.length === 0 ? (
                  <div className="bg-gray-100 rounded-xl p-8 text-center">
                    <p className="text-gray-600 text-lg">
                      Toutes les réponses ont été validées
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-100 to-red-100 rounded-xl p-8 mb-8">
                <p className="text-center text-gray-700 text-lg mb-4">
                  Les joueurs répondent <strong>Vrai</strong> ou <strong>Faux</strong>
                </p>
                {showCorrectAnswer && (
                  <div className="bg-white rounded-xl p-4 mb-4">
                    <p className="text-center text-2xl font-bold text-green-600">
                      ✅ La bonne réponse est : {
                        questions[currentQuestionIndex].answers?.find((a: any) => a.isCorrect)?.answerText || "Vrai"
                      }
                    </p>
                  </div>
                )}
                <div className="flex justify-center items-center space-x-8 mt-4">
                  <div className="text-center">
                    <div className="text-6xl mb-2">✅</div>
                    <span className="text-xl font-bold text-green-700">VRAI</span>
                  </div>
                  <div className="text-4xl text-gray-400">VS</div>
                  <div className="text-center">
                    <div className="text-6xl mb-2">❌</div>
                    <span className="text-xl font-bold text-red-700">FAUX</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton suivant */}
            <button
              onClick={handleNextQuestion}
              disabled={timer > 0}
              className={`w-full py-4 rounded-xl text-white font-bold text-xl transition ${
                timer > 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 transform hover:scale-105"
              }`}
            >
              {currentQuestionIndex < questions.length - 1 ? '➡️  Question suivante' : '🏁 Terminer le quiz'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              ✅ Jeu démarré !
            </h2>
            <p className="text-gray-600">
              La première question arrive dans 2 secondes...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
