import { useEffect, useState } from 'react';
import { socket } from "../utils/socket";
import type { Player } from "../utils/type";
import QuestionTrueFalse from "../components/QuestionTrueFalse";
import QuestionMultipleChoice from "../components/QuestionMultipleChoice";
import QuestionMultipleSelect from "../components/QuestionMultipleSelect";
import QuestionShortAnswer from "../components/QuestionShortAnswer";

export default function JoinQuiz() {
  const [pseudo, setPseudo] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showReading, setShowReading] = useState(false);
  const [readingTimer, setReadingTimer] = useState(10);
  const [canAnswer, setCanAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    isCorrect: boolean;
    pointsEarned: number;
  } | null>(null);

  // Enregistrer les écouteurs Socket.IO
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connecté à Socket.IO", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Déconnecté de Socket.IO");
    });

    socket.on("room_update", (data: Player[]) => {
      setPlayers(data);
    });

    socket.on("room_not_found", () => {
      setError("❌ Cette salle n'existe pas !");
      setConnected(false);
    });

    socket.on("game_started", () => {
      setGameStarted(true);
    });

    socket.on("answer_validated", ({ isCorrect, pointsEarned }: { isCorrect: boolean; pointsEarned: number }) => {
      setLastAnswerResult({ isCorrect, pointsEarned });
      setShowResult(true);
      if (isCorrect) {
        setValidationMessage(`✅ Réponse validée ! +${pointsEarned} points`);
      } else {
        setValidationMessage(`❌ Réponse incorrecte`);
      }
      setTimeout(() => setValidationMessage(""), 3000);
    });

    socket.on("answer_submitted", (data: { success: boolean; isCorrect?: boolean; pointsEarned?: number; pending?: boolean }) => {
      if (data.success && !data.pending && data.isCorrect !== undefined) {
        setLastAnswerResult({
          isCorrect: data.isCorrect,
          pointsEarned: data.pointsEarned || 0
        });
      }
    });

    socket.on("question_start", ({ questionIndex, question, totalQuestions }: { questionIndex: number; question: any; totalQuestions: number }) => {
      setQuestionIndex(questionIndex);
      setCurrentQuestion(question);
      setTotalQuestions(totalQuestions);
      setShowReading(true);
      setReadingTimer(10);
      setValidationMessage("");
      setShowResult(false);
      setLastAnswerResult(null);
      setCanAnswer(false);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setAnswerStartTime(null);
      setTimeRemaining(question.timeLimit || 30);
    });

    socket.on("game_ended", () => {
      alert("Quiz terminé ! Merci d'avoir participé 🎉");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("room_update");
      socket.off("room_not_found");
      socket.off("game_started");
      socket.off("answer_validated");
      socket.off("answer_submitted");
      socket.off("question_start");
      socket.off("game_ended");
    };
  }, []);

  // Timer de lecture (10 secondes)
  useEffect(() => {
    if (showReading && readingTimer > 0) {
      const interval = setInterval(() => {
        setReadingTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowReading(false);
            setCanAnswer(true);
            // Démarrer le chronomètre de réponse
            setAnswerStartTime(Date.now());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showReading, readingTimer]);

  // Timer pour le temps restant pendant la phase de réponse
  useEffect(() => {
    if (canAnswer && !hasAnswered && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanAnswer(false);
            // Afficher le résultat quand le timer expire
            setShowResult(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [canAnswer, hasAnswered, timeRemaining]);

  // Rejoindre la salle
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!pseudo.trim() || !roomCode.trim()) {
      setError("⚠️ Merci de remplir tous les champs !");
      return;
    }
    
    if (!socket.connected) {
      socket.connect();
      socket.once("connect", () => {
        socket.emit("join_room", { pseudo, roomCode: roomCode.toUpperCase() });
        setConnected(true);
      });
    } else {
      socket.emit("join_room", { pseudo, roomCode: roomCode.toUpperCase() });
      setConnected(true);
    }
  };

  // Soumettre une réponse (pour TRUE_FALSE, MULTIPLE_CHOICE)
  const handleSubmitAnswer = (answerId: number) => {
    if (!canAnswer || hasAnswered) {
      return;
    }
    
    setSelectedAnswer(answerId);
    setHasAnswered(true);
    
    const responseTime = answerStartTime 
      ? Math.round((Date.now() - answerStartTime) / 1000) 
      : 0;
    
    socket.emit("submit_answer", {
      roomCode,
      questionId: currentQuestion.id,
      answerId,
      responseTime
    });
  };

  // Soumettre plusieurs réponses (pour MULTIPLE_SELECT)
  const handleSubmitMultipleAnswers = (answerIds: number[]) => {
    if (!canAnswer || hasAnswered) return;
    
    setHasAnswered(true);
    
    const responseTime = answerStartTime 
      ? Math.round((Date.now() - answerStartTime) / 1000) 
      : 0;
    
    socket.emit("submit_answer", {
      roomCode,
      questionId: currentQuestion.id,
      answerIds,
      responseTime
    });
  };

  // Soumettre une réponse textuelle (pour SHORT_ANSWER)
  const handleSubmitTextAnswer = (answerText: string) => {
    if (!canAnswer || hasAnswered) return;
    
    setHasAnswered(true);
    
    const responseTime = answerStartTime 
      ? Math.round((Date.now() - answerStartTime) / 1000) 
      : 0;
    
    socket.emit("submit_answer", {
      roomCode,
      questionId: currentQuestion.id,
      answerText,
      responseTime
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full">
        {/* Message de validation */}
        {validationMessage && (
          <div className={`mb-4 p-4 rounded-lg text-center font-bold text-xl ${
            validationMessage.includes('✅') ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-red-100 text-red-700 border-2 border-red-500'
          }`}>
            {validationMessage}
          </div>
        )}

        {!connected ? (
          <>
            <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
              Rejoindre un quiz
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleJoin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code PIN du quiz
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Entrez le code"
                  className="w-full px-4 py-3 text-2xl text-center border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-bold tracking-wider"
                  maxLength={6}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre pseudo
                </label>
                <input
                  type="text"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Entrez votre pseudo"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  maxLength={20}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg text-xl font-bold hover:bg-green-700 transition transform hover:scale-105"
              >
                Rejoindre
              </button>
            </form>
          </>
        ) : !gameStarted ? (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
              🧩 Salle : {roomCode}
            </h2>
            <p className="text-center text-gray-600 mb-8">
              En attente du démarrage...
            </p>

            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  👥 Joueurs connectés
                </h3>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full font-bold">
                  {players.length}
                </span>
              </div>

              <div className="space-y-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      player.id === socket.id
                        ? "bg-green-100 border-2 border-green-500"
                        : "bg-white"
                    }`}
                  >
                    <span className="text-2xl">👤</span>
                    <span className="font-semibold text-gray-800">
                      {player.pseudo}
                      {player.id === socket.id && (
                        <span className="text-green-600 text-sm ml-2">
                          (Toi)
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center text-gray-500">
              <p className="animate-pulse">⏳ Attente du démarrage par l'hôte...</p>
            </div>
          </>
        ) : showReading ? (
          <>
            <div className="text-center mb-8">
              <div className="text-gray-600 mb-2">
                Question {questionIndex + 1} / {totalQuestions}
              </div>
              <div className="text-5xl font-bold text-blue-600 mb-4">
                📖 {readingTimer}s
              </div>
              <p className="text-gray-500">Lisez attentivement la question...</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {currentQuestion?.questionText}
              </h2>

              <div className="space-y-3">
                {currentQuestion?.answers?.map((answer: any, index: number) => (
                  <div
                    key={answer.id}
                    className="bg-white p-4 rounded-lg border-2 border-gray-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-700">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-lg font-medium text-gray-800">
                        {answer.answerText || currentQuestion.correctAnswerText}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : canAnswer && currentQuestion ? (
          <>
            {/* Affichage selon le type de question */}
            {currentQuestion.type === "TRUE_FALSE" && (
              <QuestionTrueFalse
                question={currentQuestion}
                questionIndex={questionIndex}
                totalQuestions={totalQuestions}
                onAnswer={handleSubmitAnswer}
                hasAnswered={hasAnswered}
                selectedAnswer={selectedAnswer}
                timeRemaining={timeRemaining}
              />
            )}

            {currentQuestion.type === "MULTIPLE_CHOICE" && (
              <QuestionMultipleChoice
                question={currentQuestion}
                questionIndex={questionIndex}
                totalQuestions={totalQuestions}
                onAnswer={handleSubmitAnswer}
                hasAnswered={hasAnswered}
                selectedAnswer={selectedAnswer}
                timeRemaining={timeRemaining}
              />
            )}

            {currentQuestion.type === "MULTIPLE_SELECT" && (
              <QuestionMultipleSelect
                question={currentQuestion}
                questionIndex={questionIndex}
                totalQuestions={totalQuestions}
                onAnswer={handleSubmitMultipleAnswers}
                hasAnswered={hasAnswered}
                timeRemaining={timeRemaining}
              />
            )}

            {currentQuestion.type === "SHORT_ANSWER" && (
              <QuestionShortAnswer
                question={currentQuestion}
                questionIndex={questionIndex}
                totalQuestions={totalQuestions}
                onAnswer={handleSubmitTextAnswer}
                hasAnswered={hasAnswered}
                timeRemaining={timeRemaining}
              />
            )}
          </>
        ) : showResult && lastAnswerResult && currentQuestion ? (
          // Affichage du résultat après avoir répondu (pour toutes les questions sauf SHORT_ANSWER qui attend validation)
          <div className="text-center space-y-6">
            <div className={`bg-gradient-to-br rounded-2xl p-8 border-4 ${
              lastAnswerResult.isCorrect 
                ? 'from-green-100 to-emerald-100 border-green-500' 
                : 'from-red-100 to-orange-100 border-red-500'
            }`}>
              <div className="text-8xl mb-4">{lastAnswerResult.isCorrect ? '✅' : '❌'}</div>
              <h2 className={`text-4xl font-bold mb-4 ${
                lastAnswerResult.isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {lastAnswerResult.isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse'}
              </h2>
              
              {lastAnswerResult.isCorrect && lastAnswerResult.pointsEarned > 0 ? (
                <div className="bg-white rounded-xl p-6 mb-4">
                  <p className="text-green-800 text-2xl font-bold">
                    +{lastAnswerResult.pointsEarned} points
                  </p>
                  <p className="text-green-600 text-sm mt-2">
                    🎯 Excellent travail !
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 mb-4">
                  <p className="text-red-800 text-xl font-bold">
                    0 point
                  </p>
                  <p className="text-red-600 text-sm mt-2">
                    {lastAnswerResult.isCorrect ? 'Trop lent cette fois !' : 'Continuez vos efforts !'}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 font-semibold mb-2">
                En attente de la prochaine question...
              </p>
              <p className="text-gray-600 text-sm">
                Question {questionIndex + 1} / {totalQuestions}
              </p>
            </div>
          </div>
        ) : !canAnswer && currentQuestion && !hasAnswered ? (
          // Temps écoulé sans réponse
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl p-8 border-4 border-red-500">
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="text-3xl font-bold text-red-700 mb-2">
                Temps écoulé !
              </h2>
              <p className="text-red-600 text-lg">
                Vous n'avez pas répondu à temps
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 font-semibold mb-2">
                En attente de la prochaine question...
              </p>
              <p className="text-gray-600 text-sm">
                Question {questionIndex + 1} / {totalQuestions}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Le jeu va commencer !
            </h2>
            <p className="text-gray-600">
              Préparez-vous pour la première question...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
