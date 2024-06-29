import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams ,useNavigate} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../styles/quiz-results.css';
import { AuthContext } from '../AuthContext';

function QuizResults() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { quizId,   } = useParams();
    const [showAnswers, setShowAnswers] = useState(false);
    const [quizSummary, setQuizSummary] = useState([]);
    const [totalScore, setTotalScore] = useState({
        score: 0,
        totalQuestions: 0
    });

    useEffect(() => {


        if (!user) {

            navigate("/");
        
           
        }


        axios.get(`http://localhost:3001/auth/quiz-results/${quizId}/${user.id}`)
            .then(response => {
                console.log('response:', response);
                setTotalScore({ score: response.data.totalScore, totalQuestions: response.data.totalQuestions });
                setQuizSummary(response.data.quizSummary);
            })
            .catch(error => {
                console.log(error.message || 'Something went wrong');
            });
    }, [ quizId]);

    const showAnswersClick = () => {
        setShowAnswers(!showAnswers);
    };

    const renderType1Question = (questionId, questionData) => {
        console.log('Rendering Type 1 Question:', questionData);
    
        return (
            <div className='item' key={questionId}>
                <span className='text-1'>{questionData.question}</span>
                <ul className='answers-wrapper'>
                    {questionData.options.map(option => {
                        console.log('Option:', option);
    
                        const isUserAnswer = questionData.userAnswer && questionData.userAnswer.answer === option.option_id.toString();
                        console.log('isUserAnswer:', isUserAnswer);
    
                        const isCorrect = questionData.correctAnswer.some(correctOption => correctOption.option_id === option.option_id.toString());
                        console.log('isCorrect:', isCorrect);
    
                        let icon = null;
                        if (isUserAnswer && questionData.userAnswer.is_correct === 1) {
                            icon = <FontAwesomeIcon className='icon check' icon={faCheck} />;
                        } else if (isUserAnswer && questionData.userAnswer.is_correct !== 1) {
                            icon = <FontAwesomeIcon className='icon wrong' icon={faTimes} />;
                        } else if (!isUserAnswer && isCorrect) {
                            icon = <FontAwesomeIcon className='icon check' icon={faCheck} />;
                        } else if (!isUserAnswer && !isCorrect && questionData.userAnswer && questionData.userAnswer.answer === option.option_id.toString()) {
                            icon = <FontAwesomeIcon className='icon wrong' icon={faTimes} />;
                        }
    
                        console.log('icon:', icon);
    
                        return (
                            <li key={option.option_id}>
                                {option.option_text}
                                {icon}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };
    







    const renderType2Question = (questionId, questionData) => {
        return (
            <div className='item' key={questionId}>
                <span className='text-1'>{questionData.question}</span>
                <ul className='answers-wrapper'>
                    <li>
                        Answer: {questionData.options[0].option_text}   {questionData.userAnswer && questionData.userAnswer.is_correct !== 1 && (
                           <FontAwesomeIcon className='icon check' icon={faCheck} />
                        )}
                        <br />
                        Your Answer: {questionData.userAnswer ? questionData.userAnswer.answer : ''}
                        {questionData.userAnswer && questionData.userAnswer.is_correct === 1 && (
                            <FontAwesomeIcon className='icon check' icon={faCheck} />
                        )}
                        {questionData.userAnswer && questionData.userAnswer.is_correct !== 1 && (
                            <FontAwesomeIcon className='icon wrong' icon={faTimes} />
                        )}
                    </li>
                </ul>
            </div>
        );
    };


    const renderQuestions = () => {
        return Object.keys(quizSummary).map(questionId => {
            const questionData = quizSummary[questionId];
            return questionData.question_type === 1
                ? renderType1Question(questionId, questionData)
                : renderType2Question(questionId, questionData);
        });
    };

    return (
        <div className='quiz-results-container'>
            <header>
                <span className='text-1'>Quiz Results</span>
                <span className='text-2'>Biology Quiz</span>
            </header>

            <main className={showAnswers ? 'main' : 'main show'}>
                <b>Your score is </b>
                <div className='score'>
                    {totalScore.score} <br />
                    <span>Out of {totalScore.totalQuestions}</span>
                </div>
                <span onClick={showAnswersClick}>See Answers</span>
            </main>

            <div className='btn-wrapper'>
                <Link to={`/answer-quiz/${quizId}`}>
                    <button className='start-Button'>Play Again</button>
                </Link>
                <Link to='/start-page'>
                    <button className='exit-Button'>Exit</button>
                </Link>
            </div>

            <div className={showAnswers ? 'answers-container show' : 'answers-container'}>
                <FontAwesomeIcon onClick={showAnswersClick} className='close' icon={faTimes} />
                {renderQuestions()}
            </div>
        </div>
    );
}

export default QuizResults;
