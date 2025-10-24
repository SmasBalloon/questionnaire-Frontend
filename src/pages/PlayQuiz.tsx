import { useParams } from 'react-router-dom';

export default function PlayQuiz() {
  const { code } = useParams<{ code: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">En attente du début du quiz...</h1>
        <p className="text-xl">Code: {code}</p>
        <div className="mt-8">
          <div className="animate-pulse bg-white/20 rounded-lg p-8">
            <p className="text-2xl">🎮</p>
            <p className="mt-4">Le quiz va bientôt commencer !</p>
          </div>
        </div>
      </div>
    </div>
  );
}
