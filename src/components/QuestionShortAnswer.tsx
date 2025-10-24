import { useState } from "react";

interface Props {
  question: any;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answerText: string) => void;
  hasAnswered: boolean;
  timeRemaining: number;
}

export default function QuestionShortAnswer({ question, questionIndex, totalQuestions, onAnswer, hasAnswered, timeRemaining }: Props) {
  const [answer, setAnswer] = useState("");

  // Si le joueur a répondu, afficher uniquement l'écran d'attente
  if (hasAnswered) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="text-gray-600 mb-2">
            Question {questionIndex + 1} / {totalQuestions}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-100 to-yellow-100 border-4 border-orange-500 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">⏱️</div>
          <div className="text-5xl font-bold text-orange-700 mb-3">
            {timeRemaining}s
          </div>
          <p className="text-orange-700 font-bold text-xl mb-3">
            ✅ Réponse enregistrée !
          </p>
          <div className="bg-white rounded-lg p-4 mb-3">
            <p className="text-gray-600 text-sm mb-1">Votre réponse :</p>
            <p className="text-gray-800 font-semibold text-lg">"{answer}"</p>
          </div>
          <p className="text-orange-600 text-sm mb-2">
            En attente de validation par l'hôte...
          </p>
          <div className="bg-blue-100 rounded-lg p-3">
            <p className="text-blue-700 text-xs">
              💡 L'hôte décidera si votre réponse est correcte
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() === "") {
      alert("Veuillez entrer une réponse !");
      return;
    }
    onAnswer(answer.trim());
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-gray-600 mb-2">
          Question {questionIndex + 1} / {totalQuestions}
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {question.questionText}
        </h2>
        <p className="text-sm text-orange-600 font-semibold">
          📝 Écrivez votre réponse
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-orange-50 rounded-xl p-6 border-4 border-orange-200">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={hasAnswered}
            placeholder="Tapez votre réponse ici..."
            className={`w-full px-6 py-4 text-xl border-2 rounded-lg focus:ring-4 focus:ring-orange-300 focus:border-orange-500 outline-none ${
              hasAnswered
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white"
            }`}
            maxLength={200}
            autoFocus
          />
          <div className="text-right text-sm text-gray-500 mt-2">
            {answer.length} / 200 caractères
          </div>
        </div>

        {!hasAnswered && (
          <button
            type="submit"
            disabled={answer.trim() === ""}
            className={`w-full py-4 rounded-xl text-white font-bold text-xl transition ${
              answer.trim() === ""
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700 transform hover:scale-105"
            }`}
          >
            Valider ma réponse
          </button>
        )}
      </form>
    </div>
  );
}
