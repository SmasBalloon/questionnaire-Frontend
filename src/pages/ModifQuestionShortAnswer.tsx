import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router';

interface Question {
  id: number;
  questionText: string;
  points: number;
  timeLimit: number;
  type: string;
  correctAnswer?: string;
}

const ModifQuestionShortAnswer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { idQuiz } = useParams<{ idQuiz: string }>();
  const navigate = useNavigate();
  const [questionTitleModif, setQuestionTitleModif] = useState('');
  const [question, setQuestion] = useState<Question>({
    id: 0,
    questionText: '',
    points: 1000,
    timeLimit: 30,
    type: 'SHORT_ANSWER',
    correctAnswer: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return <Navigate to="/login" />;
      }

      // Récupère les infos de la question
      const response = await fetch(`/api/question/title/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch question data');
      }

      const data = await response.json();
      setQuestion({
        id: data.id,
        questionText: data.questionText ?? '',
        points: data.points ?? 1000,
        timeLimit: data.timeLimit ?? 30,
        type: data.type ?? 'SHORT_ANSWER',
        correctAnswer: data.correctAnswerText ?? '',
      });
      setQuestionTitleModif(data.questionText ?? '');
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleTitleChange = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return <Navigate to="/login" />;
    }
    try {
      const response = await fetch(`/api/question/modif/title/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: questionTitleModif }),
      });
      if (!response.ok) {
        throw new Error('Failed to update question title');
      }
      fetchQuestion();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      return <Navigate to="/login" />;
    }
    try {
      // 1. Modification du temps et des points
      const response1 = await fetch(`/api/question/modif/temps-points/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timeLimit: question.timeLimit,
          points: question.points,
        }),
      });
      const data1 = await response1.json();
      if (!response1.ok) {
        throw new Error(data1.message || 'Erreur lors de la modification');
      }

      // 2. Sauvegarde de la réponse correcte
      const response2 = await fetch(`/api/question/modif/short-answer/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          correctAnswer: question.correctAnswer,
        }),
      });
      const data2 = await response2.json();
      if (!response2.ok) {
        throw new Error(data2.message || 'Erreur lors de la sauvegarde de la réponse');
      }

      alert('Modifications enregistrées avec succès');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la modification');
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Modifier Question à Réponse Courte
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Titre de la question */}
        <div className="mb-6">
          <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-2">
            Question:
          </label>
          <input
            id="questionText"
            type="text"
            value={questionTitleModif}
            onChange={(e) => setQuestionTitleModif(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {questionTitleModif && questionTitleModif !== question.questionText ? (
            <span>
              <button
                className="mr-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                onClick={handleTitleChange}
              >
                Modifier
              </button>
              <button
                className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
                onClick={() => setQuestionTitleModif(question.questionText)}
              >
                Annuler les Modifications
              </button>
            </span>
          ) : null}
        </div>

        {/* Réponse correcte attendue */}
        <div className="mb-6">
          <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700 mb-2">
            Réponse correcte attendue :
          </label>
          <input
            id="correctAnswer"
            type="text"
            value={question.correctAnswer}
            onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value })}
            placeholder="Entrez la réponse correcte"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Les réponses des joueurs seront comparées à cette réponse (sensible à la casse).
          </p>
        </div>

        {/* Temps prévu */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Temps prévu :</label>
          <div className="space-y-2">
            <label className="flex flex-col gap-2">
              <input
                type="range"
                name="timeLimit"
                min="0"
                max="120"
                value={question.timeLimit}
                onChange={(e) => setQuestion({ ...question, timeLimit: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-gray-700 text-sm font-medium text-center">
                {question.timeLimit} secondes
              </span>
            </label>
          </div>
        </div>

        {/* Nombre de points */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de points :
          </label>
          <input
            type="number"
            name="points"
            min="0"
            value={question.points}
            onChange={(e) => setQuestion({ ...question, points: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Enregistrer
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
            onClick={() => navigate('/quiz/' + idQuiz + '/edit')}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifQuestionShortAnswer;
