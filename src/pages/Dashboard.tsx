import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Layout from '../layout/layout'

interface Quiz {
  id: number;
  title: string;
  description: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [quizzes, setQuizzes] = useState<Quiz[]>([
  ]);

  // Récupérer les quiz de l'utilisateur depuis l'API
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!token){
        navigate('/login')
        return;
      }
      
      try {
        const res = await fetch('/api/quiz', {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          console.error('Failed to fetch quizzes', res.status);
          return;
        }

        const data = await res.json();
        // Adapter selon la forme renvoyée par l'API
        const list = Array.isArray(data) ? data : data?.quizzes ?? [];
        setQuizzes(list);
      } catch (e) {
        console.error(e);
      }
    };

    fetchQuizzes();
  }, [token, navigate]);

  const handleDelete = async (id: number) => {
    try {
      const data = await fetch(`/api/quiz/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (!data.ok) {
        alert('ça marche pas')
      } else {
        alert('c bon ça marche')
        setQuizzes(quizzes.filter(q => q.id !== id));
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout/>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Mes Quiz</h2>
        
        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore créé de quiz</p>
            <Link
              to="/quiz/create"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Créer mon premier quiz
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                <p className="text-gray-600 mb-4">
                  {quiz.description || ''}
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/quiz/${quiz.id}/edit`}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded text-center hover:bg-gray-300 transition"
                  >
                    Modifier
                  </Link>
                  <Link
                    to={`/quiz/${quiz.id}/play`}
                    className="flex-1 bg-green-600 text-white py-2 rounded text-center hover:bg-green-700 transition font-semibold"
                  >
                    🎮 Lancer
                  </Link>
                  <button className="flex-1 bg-red-600 text-white rounded hover:bg-red-700 transition" onClick={() => handleDelete(quiz.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
