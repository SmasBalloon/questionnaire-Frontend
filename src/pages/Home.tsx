import { Link } from 'react-router-dom';

export default function Home() {
  const token = localStorage.getItem("token")
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">
          QuizMaster
        </h1>
        <p className="text-xl text-white mb-12">
          Créez et jouez à des quiz interactifs
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/join"
            className="bg-white text-purple-600 px-8 py-4 rounded-lg text-xl font-bold hover:bg-gray-100 transition"
          >
            Rejoindre un quiz
          </Link>
          <Link
            to={token ? "/dashboard" : "/login" }
            className="bg-purple-800 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-purple-900 transition"
          >
            Créer un quiz
          </Link>
        </div>
      </div>
    </div>
  );
}
