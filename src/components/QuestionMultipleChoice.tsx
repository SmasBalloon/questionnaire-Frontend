interface Props {
  question: any;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answerId: number) => void;
  hasAnswered: boolean;
  selectedAnswer: number | null;
  timeRemaining: number;
}

export default function QuestionMultipleChoice({ question, questionIndex, totalQuestions, onAnswer, hasAnswered, selectedAnswer, timeRemaining }: Props) {
  // Si le joueur a répondu, afficher uniquement l'écran d'attente
  if (hasAnswered) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="text-gray-600 mb-2">
            Question {questionIndex + 1} / {totalQuestions}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-blue-500 rounded-2xl p-8 text-center">
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
        <p className="text-sm text-gray-500">Choisissez UNE seule réponse</p>
      </div>

      <div className="space-y-4">
        {question.answers?.map((answer: any, index: number) => (
          <button
            key={answer.id}
            onClick={() => onAnswer(answer.id)}
            disabled={hasAnswered}
            className={`w-full p-6 rounded-xl border-4 transition transform ${
              hasAnswered && selectedAnswer === answer.id
                ? "border-blue-500 bg-blue-100 scale-105"
                : hasAnswered
                ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                : "border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 hover:scale-105"
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                hasAnswered && selectedAnswer === answer.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <span className="text-lg font-semibold text-gray-800 flex-1 text-left">
                {answer.answerText}
              </span>
              {hasAnswered && selectedAnswer === answer.id && (
                <span className="text-3xl">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
