import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token')
  
  if (!token) {
    navigate('/login')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!token) {
        navigate('/login');
        return;
      }

      const rep = await fetch('/api/quiz/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: title,
          description: description
        })
      });

      if (!rep.ok) {
        const err = await rep.text().catch(() => 'Unknown error');
        alert("Erreur lors de la création du quiz: " + err);
        return;
      }

      alert("tout s'est bien passé");
      navigate('/dashboard');
    } catch (e) {
      console.error(e)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-purple-600">QuizMaster</h1>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Créer un nouveau quiz</h2>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre du quiz
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Quiz de culture générale"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre quiz..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Créer et ajouter des questions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
