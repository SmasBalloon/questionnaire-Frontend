import { Navigate } from 'react-router'
import Layout from '../layout/layout'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
interface Question {
  id: number;
  order: number;
  type: string;
  questionText: string;
  timeLimit: number;
  points: number;
}

export default function ModifQuiz () {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState<Question[]>([]);
  const fetchQuizData = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token){
          return <Navigate to="/login" />
        }
        const response = await fetch(`/api/question/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch quiz data');
        }
        const data = await response.json();
        setQuizData(data);
        console.log(data);
    } catch (e) {
      console.error(e)
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token){
        return <Navigate to="/login" />
      }
      const response = await fetch(`/api/question/${questionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      fetchQuizData();
    } catch (e) {
      console.error(e)
    }
  }

  const handleEditQuestion = (type: string, questionId: number) => {
    navigate(`/quiz/${id}/question/${type}/${questionId}`);
  }
  useEffect(() => {
    fetchQuizData();
  }, [])

  const id: string | null | undefined = typeof window !== 'undefined' ? (() => {
    const url = new URL(window.location.href)
    // prefer numeric id from query if present
    const fromQuery = url.searchParams.get('id')
    if (fromQuery && /^\d+$/.test(fromQuery)) return fromQuery
    // otherwise find the first numeric path segment (e.g. /quiz/1/edit -> "1")
    const segments = url.pathname.split('/').filter(Boolean)
    const numeric = segments.find(s => /^\d+$/.test(s)) ?? null
    return numeric
  })() : undefined

  return <>
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      <Layout/>

      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-4xl font-bold text-gray-900'>Modification du Quiz</h1>
        <button
          onClick={() => navigate(`/quiz/${id}/play`)}
          className='bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg flex items-center gap-2'
        >
          🎮 Lancer le Quiz
        </button>
      </div>

      {/* Statistiques */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-6'>Statistiques</h2>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500'>
          <p className='text-sm font-medium text-blue-600 uppercase tracking-wide'>Total Question</p>
          <p className='text-3xl font-bold text-gray-900 mt-2'>247</p>
        </div>
        
        <div className='bg-green-50 rounded-xl p-6 border-l-4 border-green-500'>
          <p className='text-sm font-medium text-green-600 uppercase tracking-wide'>Taux de Réussite</p>
          <p className='text-3xl font-bold text-gray-900 mt-2'>78%</p>
        </div>
        
        <div className='bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500'>
          <p className='text-sm font-medium text-purple-600 uppercase tracking-wide'>Temps Moyen</p>
          <p className='text-3xl font-bold text-gray-900 mt-2'>12 min</p>
        </div>
        </div>
      </div>

      {/* Liste des Questions */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-6'>Liste des Questions</h2>
        
        <div className='space-y-4'>
        {quizData.map((question) => (
          <div key={question.id} className='bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  <span className='bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full'>
                    Question {question.order}
                  </span>
                  <span className='text-sm text-gray-500'>Type: {question.type == "SHORT_ANSWER" ? "Réponse Courte" : question.type == "MULTIPLE_CHOICE" ? "Choix Unique" : question.type == "MULTIPLE_SELECT" ? "Choix Multiple" : "Vrai/Faux"}</span>
                </div>
                <p className='text-lg font-medium text-gray-900 mb-3'>
                  {question.questionText}
                </p>
                <div className='text-sm text-gray-600'>
                  <p>Temps Limite: {question.timeLimit} secondes</p>
                  <p>Points: {question.points}</p>
                </div>
              </div>
              <div className='flex gap-2 ml-4'>
                <button className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors' onClick={() => handleEditQuestion(question.type, question.id)}>
                  Modifier
                </button>
                <button onClick={() => handleDeleteQuestion(question.id)} className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}

      </div>
        
        <Link 
          to={`/create/question/${id}`}
          className='mt-6 inline-block w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-lg transition-colors shadow-md hover:shadow-lg text-center'
        >
          + Ajouter une Question
        </Link>
      </div>
      </section>
    </div>
  </>
}