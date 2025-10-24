import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router'

interface Question {
  id: number;
  correctAnswer: boolean;
  type: 'TRUE_FALSE';
}

interface Title {
  id: number;
  questionText: string;
  points: number;
  timeLimit: number;
}

const ModifQuestionTrueOrFalse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { idQuiz } = useParams<{ idQuiz: string }>();
  const navigate = useNavigate();
  const [questionTitleModif, setQuestionTitleModif] = useState('')
  const [questionTitle, setQuestionTitle] = useState<Title>({
    id: 0,
    questionText: '',
    points: 0,
    timeLimit: 0,
  });
  const [questionData, setQuestionData] = useState<Question>({
    id: 0,
    correctAnswer: false,
    type: 'TRUE_FALSE',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger la question depuis l'API
    if (id) {
      fetchQuestion();
      setLoading(false);
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token){
          return <Navigate to="/login" />
        }
        const response = await fetch(`/api/answer/info/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch question data');
        }
        const data = await response.json();
        setQuestionTitle({
          id: data.id,
          questionText: data.questionText ?? '',
          points: data.points ?? 0,
          timeLimit: data.timeLimit ?? 0,
        });
        setQuestionData({
          id: data.id,
          correctAnswer: data.correctAnswer ?? false,
          type: 'TRUE_FALSE',
        });
        setQuestionTitleModif(data.questionText ?? '');
    } catch (e) {
      console.error(e)
    }
  };

  const handleTitleChange = async () => {
    const token = localStorage.getItem("token");
    if (!token){
      return <Navigate to="/login" />
    }
    try {
      const response = await fetch(`/api/question/modif/title/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: questionTitleModif })
      });
      if (!response.ok) {
        throw new Error('Failed to update question title');
      }
      fetchQuestion();
    } catch (e) {
      console.error(e)
    }
  }

  const AnnulerModificationButton = () => {
    setQuestionTitleModif(questionTitle.questionText);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token){
      return <Navigate to="/login" />
    }
    try {
      // 1. Modification du temps et des points
      const response1 = await fetch(`/api/question/modif/temps-points/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          timeLimit: questionTitle.timeLimit,
          points: questionTitle.points
        })
      });
      const data1 = await response1.json();
      if (!response1.ok) {
        throw new Error(data1.message || 'Erreur lors de la modification');
      }

      // 2. Vérifier si on a déjà des réponses
      const answerCount = await fetch(`/api/answer/info/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const answerData = await answerCount.json();
      const hasAnswers = answerData.hasAnswers === true;

      // 3. Enregistrement ou mise à jour de la bonne réponse
      const answerEndpoint = hasAnswers ? '/api/answer/update' : '/api/answer/enregistrer';
      const answerMethod = hasAnswers ? 'PUT' : 'POST';
      
      const response2 = await fetch(answerEndpoint, {
        method: answerMethod,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          questionId: Number(id),
          isCorrect: questionData.correctAnswer
        })
      });
      const data2 = await response2.json();
      if (!response2.ok) {
        throw new Error(data2.message || 'Erreur lors de l\'enregistrement de la réponse');
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Modifier Question Vrai/Faux</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
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
          {(questionTitleModif && questionTitleModif !== questionTitle.questionText) ? (
            <span>
              <button className="mr-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200" onClick={handleTitleChange}>Modifier</button>
              <button className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200" onClick={AnnulerModificationButton}>Annuler les Modification</button>
            </span>
          ) : null}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Réponse correcte:
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="correctAnswer"
                checked={questionData.correctAnswer === true}
                onChange={() => setQuestionData({ ...questionData, correctAnswer: true })}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Vrai</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="correctAnswer"
                checked={questionData.correctAnswer === false}
                onChange={() => setQuestionData({ ...questionData, correctAnswer: false })}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Faux</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            temp prévu :
          </label>
          <div className="space-y-2">
            <label className="flex flex-col gap-2">
              <input
              type="range"
              name="timeLimit"
              min="0"
              max="120"
              value={questionTitle.timeLimit}
              onChange={(e) => setQuestionTitle({ ...questionTitle, timeLimit: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-gray-700 text-sm font-medium text-center">
              {questionTitle.timeLimit} secondes
              </span>
            </label>
          </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de points :
            </label>
            <input
              type="number"
              name="points"
              min="0"
              value={questionTitle.points}
              onChange={e => setQuestionTitle({ ...questionTitle, points: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
        </div>

        <div className="flex gap-4">
          <button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
            Enregistrer
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
            onClick={() => navigate('/quiz/' + idQuiz + '/edit') }
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifQuestionTrueOrFalse;