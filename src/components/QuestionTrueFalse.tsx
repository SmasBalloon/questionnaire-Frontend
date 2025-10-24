interface Props {
  question: any;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answerId: number) => void;
  hasAnswered: boolean;
  selectedAnswer: number | null;
  timeRemaining: number;
}

export default function QuestionTrueFalse({ question, questionIndex, totalQuestions, onAnswer, hasAnswered, selectedAnswer, timeRemaining }: Props) {
  // Trouver les réponses en supportant plusieurs formats (Vrai/vrai/True/true)
  const trueAnswer = question.answers?.find((a: any) => {
    const text = a.answerText?.toLowerCase();
    return text === "vrai" || text === "true";
  });
  
  const falseAnswer = question.answers?.find((a: any) => {
    const text = a.answerText?.toLowerCase();
    return text === "faux" || text === "false";
  });

  const handleTrueClick = () => {
    if (trueAnswer) {
      onAnswer(trueAnswer.id);
    }
  };

  const handleFalseClick = () => {
    if (falseAnswer) {
      onAnswer(falseAnswer.id);
    }
  };

  // Si le joueur a répondu, afficher uniquement l'écran d'attente
  if (hasAnswered) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="text-gray-600 mb-2">
            Question {questionIndex + 1} / {totalQuestions}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-green-100 border-4 border-blue-500 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">⏱️</div>
          <div className="text-5xl font-bold text-blue-700 mb-3">
            {timeRemaining}s
          </div>
          <p className="text-blue-700 font-bold text-xl mb-2">
            ✅ Réponse enregistrée !
          </p>
          <p className="text-blue-600 text-sm">
            Attendez la question suivante...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-gray-600 mb-2">
          Question {questionIndex + 1} / {totalQuestions}
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {question.questionText}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Bouton VRAI */}
        <button
          onClick={handleTrueClick}
          disabled={hasAnswered}
          className={`p-8 rounded-2xl border-4 transition transform ${
            hasAnswered && selectedAnswer === trueAnswer?.id
              ? "border-green-500 bg-green-100 scale-105"
              : hasAnswered
              ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
              : "border-green-400 bg-white hover:border-green-500 hover:bg-green-50 hover:scale-105"
          }`}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <span className="text-3xl font-bold text-gray-800">VRAI</span>
            {hasAnswered && selectedAnswer === trueAnswer?.id && (
              <div className="mt-3 text-green-600 font-bold">Votre réponse</div>
            )}
          </div>
        </button>

        {/* Bouton FAUX */}
        <button
          onClick={handleFalseClick}
          disabled={hasAnswered}
          className={`p-8 rounded-2xl border-4 transition transform ${
            hasAnswered && selectedAnswer === falseAnswer?.id
              ? "border-red-500 bg-red-100 scale-105"
              : hasAnswered
              ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
              : "border-red-400 bg-white hover:border-red-500 hover:bg-red-50 hover:scale-105"
          }`}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <span className="text-3xl font-bold text-gray-800">FAUX</span>
            {hasAnswered && selectedAnswer === falseAnswer?.id && (
              <div className="mt-3 text-red-600 font-bold">Votre réponse</div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
