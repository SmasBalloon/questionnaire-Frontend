import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router';

interface Answer {
  id?: number;
  answerText: string;
  isCorrect: boolean;
  order: number;
}

interface Question {
  id: number;
  questionText: string;
  points: number;
  timeLimit: number;
  type: string;
}

const ModifQuestionMultipleSelect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { idQuiz } = useParams<{ idQuiz: string }>();
  const navigate = useNavigate();
  const [questionTitleModif, setQuestionTitleModif] = useState('');
  const [question, setQuestion] = useState<Question>({
    id: 0,
    questionText: '',
    points: 1000,
    timeLimit: 30,
    type: 'MULTIPLE_SELECT',
  });
  const [answers, setAnswers] = useState<Answer[]>([]);
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
        type: data.type ?? 'MULTIPLE_SELECT',
      });
      setQuestionTitleModif(data.questionText ?? '');

      // Récupère les réponses existantes
      const answersResponse = await fetch(`/api/answer/question/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (answersResponse.ok) {
        const answersData = await answersResponse.json();
        setAnswers(answersData || []);
      }

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

      alert('Modifications enregistrées avec succès');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la modification');
    }
  };

  const addAnswer = () => {
    const newAnswer: Answer = {
      answerText: '',
      isCorrect: false,
      order: answers.length + 1,
    };
    setAnswers([...answers, newAnswer]);
  };

  const updateAnswer = (index: number, field: keyof Answer, value: string | boolean) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = { ...updatedAnswers[index], [field]: value };
    setAnswers(updatedAnswers);
  };

  const removeAnswer = (index: number) => {
    const updatedAnswers = answers.filter((_, i) => i !== index);
    setAnswers(updatedAnswers);
  };

  const saveAnswers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return <Navigate to="/login" />;
    }
    try {
      const response = await fetch(`/api/answer/save-multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: Number(id),
          answers: answers,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la sauvegarde des réponses');
      }
      alert('Réponses enregistrées avec succès');
      fetchQuestion();
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la sauvegarde des réponses');
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Modifier Question à Choix Multiple
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

        {/* Réponses */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Réponses (plusieurs bonnes réponses possibles) :
          </label>
          {answers.map((answer, index) => (
            <div key={index} className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={answer.isCorrect}
                onChange={(e) => updateAnswer(index, 'isCorrect', e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
              />
              <input
                type="text"
                value={answer.answerText}
                onChange={(e) => updateAnswer(index, 'answerText', e.target.value)}
                placeholder={`Réponse ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeAnswer(index)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md transition duration-200"
              >
                Supprimer
              </button>
            </div>
          ))}
          <button
            onClick={addAnswer}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            + Ajouter une réponse
          </button>
          {answers.length > 0 && (
            <button
              onClick={saveAnswers}
              className="mt-2 ml-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Enregistrer les réponses
            </button>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Enregistrer la question
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

export default ModifQuestionMultipleSelect;
