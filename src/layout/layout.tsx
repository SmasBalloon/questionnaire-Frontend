import { Link, useNavigate } from 'react-router-dom';


export default function Layout () {
  const navigate = useNavigate()

  const handledeco = async () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return(
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-600">QuizMaster</h1>
        <div className="flex gap-4">
          <Link
            to="/quiz/create"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Créer un quiz
          </Link>
          <button className="text-gray-600 hover:text-gray-800" onClick={handledeco}>
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}