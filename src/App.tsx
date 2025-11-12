import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JoinQuiz from './pages/JoinQuiz';
import CreateQuiz from './pages/CreateQuiz';
import PlayQuiz from './pages/PlayQuiz';
import ModifQuiz from './pages/ModifQuiz'
import ProtectedRoutes from './middleware/ProtectedRoutes'
import CreateQuestion from './pages/CreateQuestion'
import ModifQuestionTrueOrFalse from './pages/ModifQuestionTrueOrFalse';
import ModifQuestionMultipleChoice from './pages/ModifQuestionMultipleChoice';
import ModifQuestionMultipleSelect from './pages/ModifQuestionMultipleSelect';
import ModifQuestionShortAnswer from './pages/ModifQuestionShortAnswer';
import PlayQuizHost from './pages/PlayQuizHost';

function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/join" element={<JoinQuiz />} />
      <Route path="/play/:code" element={<PlayQuiz />} />

      {/* Routes protégées */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz/create" element={<CreateQuiz />} />
        <Route path="/quiz/:id/edit" element={<ModifQuiz/>} />
        <Route path="/quiz/:id/play" element={<PlayQuizHost/>} />
        <Route path="/create/question/:id" element={<CreateQuestion/>} />
        <Route path="/quiz/:idQuiz/question/TRUE_FALSE/:id" element={<ModifQuestionTrueOrFalse/>} />
        <Route path="/quiz/:idQuiz/question/MULTIPLE_CHOICE/:id" element={<ModifQuestionMultipleChoice/>} />
        <Route path="/quiz/:idQuiz/question/MULTIPLE_SELECT/:id" element={<ModifQuestionMultipleSelect/>} />
        <Route path="/quiz/:idQuiz/question/SHORT_ANSWER/:id" element={<ModifQuestionShortAnswer/>} />
      </Route>
    </Routes>
  );
}

export default App;
