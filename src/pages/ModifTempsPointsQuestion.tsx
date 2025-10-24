import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ModifTempsPointsQuestion()  {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [points, setPoints] = useState<number>(1000);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/question/modif/temps-points/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ timeLimit, points })
      });
      const data = await response.json();
      if (response.ok && data.question) {
        setMessage('Modification réussie !');
      } else {
        setMessage(data.message || 'Erreur lors de la modification');
      }
    } catch (err) {
      setMessage('Erreur réseau ou serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Modifier temps et points</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="timeLimit" className="block mb-1">Temps prévu (secondes) :</label>
          <input
            id="timeLimit"
            type="number"
            value={timeLimit}
            onChange={e => setTimeLimit(Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="points" className="block mb-1">Nombre de points :</label>
          <input
            id="points"
            type="number"
            value={points}
            onChange={e => setPoints(Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Modification...' : 'Enregistrer'}
        </button>
        {message && <div className="mt-2 text-center text-red-600">{message}</div>}
      </form>
      <button
        className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
        onClick={() => navigate('/questions')}
      >
        Retour
      </button>
    </div>
  );
};


