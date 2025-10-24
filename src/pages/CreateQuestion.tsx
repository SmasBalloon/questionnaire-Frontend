import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export default function CreateQuestion() {
  const [Temp, setTemp] = useState(30);
  const [title, setTitle] = useState('');
  const [Type, setType] = useState('');
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !title || Type === "") {
      alert("objectif ou titre manquant");
      return;
    }

    const rep = await fetch('/api/question/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idQuiz: id,
        title: title,
        type: Type,
        timeLimit: Temp,
      }),
    });
    if (rep.ok) {
      console.log("Question créée avec succès");
      navigate(`/quiz/${id}/edit`);
    } else {
      alert("Erreur lors de la création de la question");
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6 text-purple-600">
          Creer une question
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intituler de la Question
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temps (seconde): {Temp}
          </label>
          <input
            type="range"
            min="5"
            max="60"
            value={Temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="w-full"
          />
          </div>
          
            <div className="flex flex-col space-y-1">
            <label
              className="text-sm font-medium text-gray-700">
                Type de Question :
            </label>
            <select
              id="course-select"
              value={Type}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Sélectionner un type</option>
              <option value="MULTIPLE_CHOICE">
                Choix simple
              </option>
              <option value="MULTIPLE_SELECT">
                Choix multiple
              </option>
              <option value="TRUE_FALSE">
                Vrai ou Faux
              </option>
              <option value="SHORT_ANSWER">
                Reponce écrite
              </option>
            </select>
            </div>
          
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Creer la Question
          </button>
        </form>

        <Link
          to="/"
          className="block text-center mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}