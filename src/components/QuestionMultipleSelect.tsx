import { useState } from "react";

interface Props {
  question: any;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answerIds: number[]) => void;
  hasAnswered: boolean;
  timeRemaining: number;
}

export default function QuestionMultipleSelect({ question, questionIndex, totalQuestions, onAnswer, hasAnswered, timeRemaining }: Props) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

  // Si le joueur a répondu, afficher uniquement l'écran d'attente
  if (hasAnswered) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="text-gray-600 mb-2">
            Question {questionIndex + 1} / {totalQuestions}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-500 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">⏱️</div>
          <div className="text-5xl font-bold text-purple-700 mb-3">
            {timeRemaining}s
          </div>
          <p className="text-purple-700 font-bold text-xl mb-2">
            ✅ Réponses enregistrées !
          </p>
          <p className="text-purple-600 text-sm">
            Attendez la question suivante...
          </p>
        </div>
      </div>
    );
  }

  const toggleAnswer = (answerId: number) => {
    if (hasAnswered) return;
    
    setSelectedAnswers((prev) => {
      if (prev.includes(answerId)) {
        return prev.filter((id) => id !== answerId);
      } else {
        return [...prev, answerId];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedAnswers.length === 0) {
      alert("Veuillez sélectionner au moins une réponse !");
      return;
    }
    onAnswer(selectedAnswers);
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
        <p className="text-sm text-purple-600 font-semibold">
          ⚠️ Plusieurs réponses possibles - Cochez toutes les bonnes réponses
        </p>
      </div>

      <div className="space-y-4">
        {question.answers?.map((answer: any, index: number) => (
          <button
            key={answer.id}
            onClick={() => toggleAnswer(answer.id)}
            disabled={hasAnswered}
            className={`w-full p-6 rounded-xl border-4 transition transform ${
              selectedAnswers.includes(answer.id)
                ? "border-purple-500 bg-purple-100 scale-105"
                : hasAnswered
                ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                : "border-gray-300 bg-white hover:border-purple-500 hover:bg-purple-50 hover:scale-105"
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold border-2 ${
                selectedAnswers.includes(answer.id)
                  ? "bg-purple-500 text-white border-purple-500"
                  : "bg-white text-gray-700 border-gray-300"
              }`}>
                {selectedAnswers.includes(answer.id) ? "✓" : String.fromCharCode(65 + index)}
              </div>
              <span className="text-lg font-semibold text-gray-800 flex-1 text-left">
                {answer.answerText}
              </span>
            </div>
          </button>
        ))}
      </div>

      {!hasAnswered && (
        <button
          onClick={handleSubmit}
          disabled={selectedAnswers.length === 0}
          className={`w-full py-4 rounded-xl text-white font-bold text-xl transition ${
            selectedAnswers.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 transform hover:scale-105"
          }`}
        >
          Valider ({selectedAnswers.length} réponse{selectedAnswers.length > 1 ? 's' : ''} sélectionnée{selectedAnswers.length > 1 ? 's' : ''})
        </button>
      )}
    </div>
  );
}
