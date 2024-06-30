import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faPersonRunning, faFlagCheckered, faTimes, faCheck, faMusic, faDrum } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import questionMark from "../assets/Question.png";
import LeftArrow from '../assets/leftarrow.png';
import RightArrow from '../assets/rightarrow.png';
import '../styles/select-type.css';
import '../styles/answer-quiz.css';

import gameMusicSound from '../assets/quizBgm.mp3';
import gameStartSound from '../assets/gameStart.mp3';
import correctAnswerSound from '../assets/correctAnswer.mp3';
import wrongAnswerSound from '../assets/wrongAnswer.wav';


// Import the environment variable
const apiUrl = import.meta.env.VITE_API_URL;
 


function AnswerQuiz() {
    const { quizId } = useParams();
    const { user } = useContext(AuthContext);
    const [showSetting, setShowSetting] = useState(localStorage.getItem('showSetting') === 'true');

    const [questions, setQuestions] = useState([]);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [activeAnswer, setActiveAnswer] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [correctness, setCorrectness] = useState({});
    const [answeredQuestions, setAnsweredQuestions] = useState({});
    const [sfx, setSfx] = useState(true);
    const [music, setMusic] = useState(true);

    const gameStartAudioRef = useRef(new Audio(gameStartSound));
    const gameMusicAudioRef = useRef(new Audio(gameMusicSound));
    const correctAnswerAudioRef = useRef(new Audio(correctAnswerSound));
    const wrongAnswerAudioRef = useRef(new Audio(wrongAnswerSound));


    const textareaRef = useRef(null);





    useEffect(() => {
        adjustHeight();
    }, [questions]);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };
    const navigate = useNavigate();

    const testCLick = () => {

        console.log("questions:", questions);
        console.log('userAnsewrs:', userAnswers);
        console.log('correctness', correctness);
        console.log('answeredQ', answeredQuestions)



        // {
        //     "0": {
        //         "type": "choice",
        //         "answer": 162
        //     },
        //     "1": {
        //         "type": "text",
        //         "answer": "-1"
        //     }
        // }


    }
    useEffect(() => {
        if (!user) {
            navigate("/");
        }

        axios.get(`${apiUrl}/auth/questions/${quizId}`)
            .then(response => {
                const sortedQuestions = response.data.questions.sort((a, b) => a.question_id - b.question_id);
                setQuestions(sortedQuestions);

                return axios.get(`${apiUrl}/auth/quiz-results/${quizId}/${user.id}`);
            })
            .then(summaryResponse => {
                const summaryData = summaryResponse.data;

                const initialUserAnswers = {};
                const initialCorrectness = {};
                const initialAnsweredQuestions = {};

                const quizSummaryArray = Object.keys(summaryData.quizSummary).map(questionId => ({
                    question_id: parseInt(questionId),
                    ...summaryData.quizSummary[questionId]
                }));

                quizSummaryArray.sort((a, b) => a.question_id - b.question_id);

                quizSummaryArray.forEach((question, index) => {
                    if (question.userAnswer) {
                        // Update userAnswers based on user's previous answers
                        if (question.question_type === 1) {
                            initialUserAnswers[index.toString()] = {
                                type: 'choice',
                                answer: parseInt(question.userAnswer.answer)
                            };
                        } else if (question.question_type === 2) {
                            initialUserAnswers[index.toString()] = {
                                type: 'text',
                                answer: question.userAnswer.answer
                            };
                        }

                        // Update correctness based on user's previous answers
                        const isCorrect = question.userAnswer.is_correct === 1;
                        initialCorrectness[index.toString()] = isCorrect ? 'correct' : 'wrong';

                        // Update answeredQuestions based on user's previous answers
                        initialAnsweredQuestions[index.toString()] = true;
                    }
                });

                console.log('TEST initialUserAnswers:', initialUserAnswers);
                console.log('TEST initialCorrectness:', initialCorrectness);
                console.log('TEST initialAnsweredQuestions', initialAnsweredQuestions);

                setUserAnswers(initialUserAnswers);
                setCorrectness(initialCorrectness);
                setAnsweredQuestions(initialAnsweredQuestions);
            })
            .catch(error => {
                console.error('Error fetching quiz summary or questions:', error);
            });

        const initialShowSetting = localStorage.getItem('showSetting') === 'true';
        console.log(initialShowSetting);
        setShowSetting(initialShowSetting);
        // if (initialShowSetting && music) {
        //     setMusicStarted(true);
        // }
    }, [quizId, music, user]);




    const [musicStarted, setMusicStarted] = useState(false);

    // In the useEffect for music
    useEffect(() => {
        if (musicStarted && music) {
            gameMusicAudioRef.current.loop = true;
            gameMusicAudioRef.current.play();
        } else {
            gameMusicAudioRef.current.pause();
            gameMusicAudioRef.current.currentTime = 0;
        }

        return () => {
            gameMusicAudioRef.current.pause();
            gameMusicAudioRef.current.currentTime = 0;
        };
    }, [music, musicStarted]);


    useEffect(() => {
        // Function to run when component is about to unmount (page refresh/close)
        const handleBeforeUnload = (event) => {


            // Store data in localStorage
            localStorage.setItem('showSetting', 'true');


            // axios.delete(`http://localhost:3001/auth/questions/${quizId}/${user.id}`)
            //     .then(response => {
            //         if (response.data.success) {
            //             console.log(response.data.message);

            //         } else {
            //             console.error('Failed to delete the quiz.');
            //         }
            //     })
            //     .catch(error => {
            //         console.error('Error deleting the quiz:', error);
            //     });


        };

        // Add event listener for beforeunload
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Clean up the event listener when component unmounts
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []); // Empty dependency array ensures this effect runs only once (on mount) and cleans up on unmount



    const showSettingClick = () => {
        setShowSetting(!showSetting);
        if (!musicStarted && music) {
            setMusicStarted(!musicStarted);
        }
        localStorage.setItem('showSetting', !showSetting);
    };


    const handleAnswerClick = (optionId) => {
        if (answeredQuestions[activeQuestionIndex]) return;

        setActiveAnswer(optionId);
        setUserAnswers(prev => ({
            ...prev,
            [activeQuestionIndex]: { type: 'choice', answer: optionId }
        }));
    };

    const handleInputChange = (event) => {
        setUserAnswers(prev => ({
            ...prev,
            [activeQuestionIndex]: { type: 'text', answer: event.target.value }
        }));
    };

    const nextQuestion = () => {
        setActiveQuestionIndex(prevIndex => Math.min(prevIndex + 1, questions.length - 1));
        setActiveAnswer(null);
    };

    const prevQuestion = () => {
        setActiveQuestionIndex(prevIndex => Math.max(prevIndex - 1, 0));
        setActiveAnswer(null);
    };

    const handleSubmit = () => {
        const newCorrectness = {};

        // Calculate correctness locally
        questions.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            if (userAnswer) {
                if (question.question_type === 1) {
                    newCorrectness[index] = question.correct_option_ids.includes(userAnswer.answer) ? 'correct' : 'wrong';
                } else if (question.question_type === 2) {
                    const correctAnswers = question.options.map(option => option.option_text.trim().toLowerCase());
                    const userEnteredAnswer = userAnswer.answer.trim().toLowerCase();
                    newCorrectness[index] = correctAnswers.includes(userEnteredAnswer) ? 'correct' : 'wrong';
                }
            }
        });

        setCorrectness(newCorrectness);

        const answerToSave = {
            user_id: user.id,
            question_id: questions[activeQuestionIndex].question_id,
            answer_text: userAnswers[activeQuestionIndex]?.answer,
            is_correct: newCorrectness[activeQuestionIndex] === 'correct'
        };

        console.log('answerstosave', answerToSave);

        if (newCorrectness[activeQuestionIndex] === 'correct' && sfx) {
            correctAnswerAudioRef.current.play();
        } else if (newCorrectness[activeQuestionIndex] === 'wrong' && sfx) {
            wrongAnswerAudioRef.current.play();
        }

        axios.post(`${apiUrl}/auth/save-answer`, { answers: [answerToSave] })
            .then(response => {
                // console.log('Answers saved successfully');
                setAnsweredQuestions(prev => ({
                    ...prev,
                    [activeQuestionIndex]: true
                }));
            })
            .catch(error => {
                console.error('Error saving answers:', error);
            });
    };








    const handleDone = () => {
        navigate(`/answer-quiz/quiz-result/${quizId}`);
    };

    const currentQuestion = questions[activeQuestionIndex];
    const totalQuestions = questions.length;
    const answeredQuestionsCount = Object.keys(answeredQuestions).length;
    const remainingQuestions = totalQuestions - answeredQuestionsCount;
    const progress = (answeredQuestionsCount / totalQuestions) * 100;

    return (
        <div className='answer-quiz-container'>
            <div className={showSetting ? 'exit-confirm-container show' : 'exit-confirm-container'} style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}>
                <div className='exit-wrapper'>
                    <div className='progress-container'>
                        <div className='row-1'>
                            <FontAwesomeIcon className='run' icon={faPersonRunning} />
                            <FontAwesomeIcon className='flag' icon={faFlagCheckered} />
                        </div>
                        <div className='row-2'>
                            <span className='bar' style={{ width: `${progress}%` }}></span>
                        </div>
                        <div className='row-3'>
                            <span className='text-1'>Start</span>
                            <span className='text-2'>End</span>
                        </div>
                        <label>{remainingQuestions} Questions Remaining</label>
                    </div>
                    <div className='ctrl-wrapper'>
                        <button onClick={showSettingClick} className='btn-2'>Resume</button>
                        <Link to='/start-page'><button className='btn-1'>Save & Exit</button></Link>
                    </div>
                </div>
                <div className='settings-wrapper'>
                    <span className='text-1'>Settings</span>
                    <div className='row'>
                        <div className='left'>
                            <FontAwesomeIcon className='icon' icon={faMusic} />
                            Music
                        </div>
                        <input type="checkbox" checked={music} onChange={() => setMusic(!music)} />
                    </div>
                    <div className='row'>
                        <div className='left'>
                            <FontAwesomeIcon className='icon' icon={faDrum} />
                            Sound Effects
                        </div>
                        <input type="checkbox" checked={sfx} onChange={() => setSfx(!sfx)} />
                    </div>
                </div>
            </div>
            <div className='header'>


                <svg className='answer-svg' width="593" height="628" viewBox="0 0 593 428" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgb(0,91,255)" stopOpacity="1" />
                            <stop offset="100%" stopColor="rgb(87,147,255)" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M412.448 141.5C324.948 303 129.948 247.5 40.9481 400C-48.0517 552.5 39.4482 1 39.4482 1H412.448L412.448 141.5Z"
                        fill="url(#grad1)"
                    />
                </svg>


                <Link onClick={showSettingClick} className='exit'><FontAwesomeIcon icon={faCog} /></Link>
                <div className='ctrl-wrapper'>
                    <span className='text-2' onClick={testCLick}>Questions</span>
                    <span className='text-1'>{activeQuestionIndex + 1}/{totalQuestions}</span>
                </div>
            </div>
            <div className={`question-wrapper ${correctness[activeQuestionIndex]}`}>
                {correctness[activeQuestionIndex] && (
                    <i className={`answer ${correctness[activeQuestionIndex]}`}>
                        <FontAwesomeIcon icon={correctness[activeQuestionIndex] === 'correct' ? faCheck : faTimes} />
                    </i>
                )}
                {currentQuestion &&
                    // < input type="text" value={currentQuestion.question} readOnly />}
                    <textarea value={currentQuestion.question} ref={textareaRef} readOnly></textarea>}

            </div>
            {currentQuestion && currentQuestion.question_type === 1 ?
                <div className='answers-wrapper'  >
                    {currentQuestion.options.map((option) => (
                        <div
                            key={option.option_id}
                            className={`item ${userAnswers[activeQuestionIndex] && userAnswers[activeQuestionIndex].answer === option.option_id ? 'clicked' : ''}
                 ${correctness[activeQuestionIndex] && currentQuestion.correct_option_ids.includes(option.option_id)
                                    ? 'correct' : ''} ${correctness[activeQuestionIndex] === 'wrong' && userAnswers[activeQuestionIndex] && userAnswers[activeQuestionIndex].answer === option.option_id
                                        && !currentQuestion.correct_option_ids.includes(option.option_id) ? 'wrong' : ''}`}
                            onClick={() => handleAnswerClick(option.option_id)}
                            style={{ pointerEvents: answeredQuestions[activeQuestionIndex] ? 'none' : 'auto' }}
                        >
                            <span>{option.option_text}</span>
                        </div>
                    ))}
                </div> :
                <div className='blank-answer-wrapper'>
                    <div className={`item ${correctness[activeQuestionIndex]}`}>
                        <input
                            type="text"
                            placeholder='Type your answer here'
                            value={userAnswers[activeQuestionIndex]?.answer || ''}
                            onChange={handleInputChange}
                            readOnly={answeredQuestions[activeQuestionIndex]}
                        />
                    </div>
                </div>
            }


            <div className='page-ctrl-wrapper'>
                {activeQuestionIndex > 0 && <img className='left' src={LeftArrow} alt="Previous" onClick={prevQuestion} />}
                {activeQuestionIndex < questions.length - 1 && <img className='right' src={RightArrow} alt="Next" onClick={nextQuestion} />}
            </div>
            <div className='footer'>
                {progress === 100 ? (
                    <button onClick={handleDone}><span>Done</span></button>
                ) : (
                    !answeredQuestions[activeQuestionIndex] && (
                        <button onClick={handleSubmit}><span>Submit</span></button>
                    )
                )}
            </div>
        </div>
    );
}

export default AnswerQuiz;
