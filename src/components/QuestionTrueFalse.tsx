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
  // Chercher les réponses Vrai/Faux dans le tableau answers
  let trueAnswer = question.answers?.find((a: any) => {
    const text = a.answerText?.toLowerCase().trim();
    return text === "vrai" || text === "true";
  });
  
  let falseAnswer = question.answers?.find((a: any) => {
    const text = a.answerText?.toLowerCase().trim();
    return text === "faux" || text === "false";
  });

  // Fallback: si on ne trouve qu'une réponse, on crée l'autre
  if (question.answers && question.answers.length === 1) {
    const existingAnswer = question.answers[0];
    const isTrue = existingAnswer.answerText?.toLowerCase().trim() === "true" || 
                   existingAnswer.answerText?.toLowerCase().trim() === "vrai";
    
    if (isTrue) {
      trueAnswer = existingAnswer;
      falseAnswer = {
        id: existingAnswer.id + 1000,
        answerText: "Faux",
        isCorrect: false
      };
    } else {
      falseAnswer = existingAnswer;
      trueAnswer = {
        id: existingAnswer.id + 1000,
        answerText: "Vrai",
        isCorrect: false
      };
    }
  }
  
  // Dernier fallback: créer les deux réponses si elles n'existent pas
  if (!trueAnswer && !falseAnswer) {
    trueAnswer = {
      id: 1,
      answerText: "Vrai",
      isCorrect: question.correctAnswerText?.toLowerCase().trim() === "vrai" || 
                 question.correctAnswerText?.toLowerCase().trim() === "true"
    };
    falseAnswer = {
      id: 2,
      answerText: "Faux",
      isCorrect: question.correctAnswerText?.toLowerCase().trim() === "faux" || 
                 question.correctAnswerText?.toLowerCase().trim() === "false"
    };
  }

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
