import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { GoogleOAuthProvider  } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import {GoogleLogin} from '@react-oauth/google';
import { AuthProvider } from './AuthContext';
import HomePage from './pages/home-page';
import StartPage from './pages/start-page';
import LoginPage from './pages/login-page';
import SignupPage from './pages/signup-page';
import AccCreatedPage from './pages/acc-created-page';
import CreateQuiz from './pages/create-quiz';
import SelectType from './pages/select-type';
import CreateMultipleChoice from './pages/create-multiple-choice';
import QuizCreated from './pages/quiz-created';
import AnswerQuiz from './pages/answer-quiz';
import QuizResults from './pages/quiz-results';
import PlayQuiz from './pages/play-quiz';
import Quizzes from './pages/quizzes';
import EditQuiz from './pages/edit-quiz';
import './styles/Quizziz.css';

import Loading from './pages/loading'

function Quizziz() {
 
  const navigate = useNavigate(); 
 

  // Wrap the useGoogleLogin hook within GoogleOAuthProvider
  return (
  <div className='main-container'>


      {/* <GoogleLogin
        onSuccess={credentialResponse => {
          const decoded = jwtDecode(credentialResponse.credential);
          console.log(credentialResponse);
          console.log('DEcoded:',decoded);
        }}
        onError={() => {
          console.log('Login Failed');
        }}
      />  */}




      {/* <Loading/> */}



        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/start-page" element={<StartPage />} />
            <Route path="/login-page" element={<LoginPage />} />
            <Route path="/signup-page" element={<SignupPage />} />
            <Route path="/acc-created" element={<AccCreatedPage />} />
            <Route path="/create-quiz" element={<CreateQuiz />} />
            <Route path="/create-quiz/select-type" element={<SelectType />} />
            <Route path="/create-quiz/multiple-choice" element={<CreateMultipleChoice />} />
            <Route path="/create-quiz/quiz-created" element={<QuizCreated />} />
            <Route path="/answer-quiz/:quizId" element={<AnswerQuiz />} />
            <Route path="/answer-quiz/quiz-result/:quizId" element={<QuizResults />} />
            <Route path="/play-quiz" element={<PlayQuiz />} />
            <Route path="/play-quiz/quizzes/:categoryId" element={<Quizzes />} />
            <Route path="/edit-quiz/:quizId" element={<EditQuiz />} />
          </Routes>
        </AuthProvider>
      </div>
   
  );
}

export default Quizziz;
