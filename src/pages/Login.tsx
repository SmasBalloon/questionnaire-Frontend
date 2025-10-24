import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!email || !password) {
        alert("Veuillez remplir tous les champs.");
        return;
      }
      
      // Ici, vous pouvez ajouter la logique pour envoyer les données de connexion au backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      const token = data.token
      console.log(token)
      localStorage.setItem('token', token)
      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed:", error);
    }
    
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6 text-purple-600">
          Connexion
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Se connecter
          </button>
        </form>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-purple-600 hover:underline">
            S'inscrire
          </Link>
        </p>
        
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
