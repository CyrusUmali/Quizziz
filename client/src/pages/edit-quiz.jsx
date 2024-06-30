


import React from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckCircle, faL, faPlus, faSave, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Link } from 'react-router-dom';

import { useState, useContext, useEffect ,useRef } from 'react';
import { AuthContext } from '../AuthContext';
import '../styles/create-multiple-choice.css';
import questionMark from "../assets/Question.png";
import LeftArrow from '../assets/leftarrow.png';
import RightArrow from '../assets/rightarrow.png';
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL;


function EditQuiz() {
    const { quizId } = useParams;
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showExit, setShowExit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [questions, setQuestions] = useState(JSON.parse(sessionStorage.getItem('questions')) || []);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
        parseInt(sessionStorage.getItem('nextNumber'), 10)
    );
    const [moreThanOneCorrect, setMoreThanOneCorrect] = useState(false);
    const [showSaveCheck, setShowSaveCheck] = useState(false);


    const hideSaveCheck = () => {

        setShowSaveCheck(false);

    }

    const doneClick = () => {

        saveClick();

    }

    useEffect(() => {



        if (!user) {

            navigate("/");


        }
        // Check if questions array is empty
        if (!currentQuestion && questions.length > 0) {
            navigate("/");
        } else {
            axios.get(`${apiUrl}/auth/questions/edit/${quizId}`)
                .then(response => {
                    console.log(response)
                    sessionStorage.setItem('questions', JSON.stringify(questions));
                })
                .catch(error => {
                    console.log(error.message || 'Something went wrong');
                });
        }






    }, [questions]);

    const saveClick = () => {
        console.log('test', questions[currentQuestionIndex].options);




        console.log('Questions', questions)

        console.log('QuizTitle', sessionStorage.getItem('quizTitle'));
        console.log('QuizCategory', sessionStorage.getItem('quizCategory'));


        if (questions[currentQuestionIndex].questionId === null) {
            axios
                .post(`${apiUrl}/auth/save-question`, {
                    quizId: sessionStorage.getItem('quizId'),
                    questionText: questions[currentQuestionIndex].questionText,
                    questionType: questions[currentQuestionIndex].questionType,
                    options: questions[currentQuestionIndex].options,
                    correctOptions: questions[currentQuestionIndex].correctOptions
                })
                .then(response => {
                    console.log('Question saved successfully:', response.data);
                    const { questionId } = response.data;

                    setShowSaveCheck(true);

                    console.log('showcheck:', showSaveCheck);


                    // Update the questionId of the current question
                    setQuestions(prevQuestions => {
                        const updatedQuestions = [...prevQuestions];
                        updatedQuestions[currentQuestionIndex].questionId = questionId;
                        return updatedQuestions;
                    });
                    // Handle success, e.g., show a success message, update state, etc.
                })
                .catch(error => {
                    console.error('Error saving question:', error.response ? error.response.data : error.message);
                    // Handle error, e.g., show an error message
                });

        } else {
            console.log('update');


            axios
                .put(`${apiUrl}/auth/update-question/${currentQuestion.questionId}`, {
                    quizId: sessionStorage.getItem('quizId'),
                    questionText: currentQuestion.questionText,
                    questionType: currentQuestion.questionType,
                    options: currentQuestion.options,
                    correctOptions: currentQuestion.correctOptions
                })
                .then(response => {
                    console.log('Question updated successfully:', response.data);

                    setShowSaveCheck(true);

                    console.log('showcheck:', showSaveCheck);
                    // Handle success, e.g., show a success message, update state, etc.
                })
                .catch(error => {
                    console.error('Error updating question:', error.response ? error.response.data : error.message);
                    // Handle error, e.g., show an error message
                });

        }



    };


    const navigateTo = (path, data) => {
        navigate(path, { state: data });
    };


    const textareaRef = useRef(null);
    useEffect(() => {
        adjustHeight();
    }, [questions]);


    const adjustHeight = () => {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };



    const showLogoutClick = () => {
        setShowExit(!showExit);
    };

    const showDeleteClick = () => {
        setShowDelete(!showDelete);
    };

    const addNewQuestionClick = () => {


        saveClick();
        const newIndex = currentQuestionIndex + 1;

        const newQuestions = [
            ...questions.slice(0, newIndex),
            {
                questionType: parseInt(sessionStorage.getItem('questionType')),
                questionText: '',
                options: [''],
                correctOptions: [], // Initialize correctOptions as an empty array
                questionId: null
            },
            ...questions.slice(newIndex)
        ];

        setQuestions(newQuestions);
        setCurrentQuestionIndex(newIndex);

        navigateTo('/create-quiz/select-type', { myData: 'addQuestion', nextNumber: currentQuestionIndex });
    };

    const deleteCurrentQuestion = () => {

        if (questions[currentQuestionIndex].questionId === null) {

            if (questions.length > 1) {
                const newQuestions = questions.filter((_, index) => index !== currentQuestionIndex);
                setQuestions(newQuestions);
                setCurrentQuestionIndex((prevIndex) => (prevIndex === 0 ? 0 : prevIndex - 1));
                setShowDelete(false);

            } else {
                alert("You must have at least one question.");
            }

        } else {


            if (questions.length > 1) {
                const questionToDelete = questions[currentQuestionIndex].questionId; // Assuming each question has a unique id

                axios.delete(`${apiUrl}/auth/delete-question/${questionToDelete}`)
                    .then((response) => {
                        if (response.data.success) {
                            const newQuestions = questions.filter((_, index) => index !== currentQuestionIndex);
                            setQuestions(newQuestions);
                            setCurrentQuestionIndex((prevIndex) => (prevIndex === 0 ? 0 : prevIndex - 1));
                            setShowDelete(false);
                        } else {
                            alert("Error deleting the question. Please try again.");
                        }
                    })
                    .catch((error) => {
                        console.error('Error deleting question:', error);
                        alert("Error deleting the question. Please try again.");
                    });
            } else {
                alert("You must have at least one question.");
            }



        }


    };

    const deleteOption = (optionIndex) => {
        const newOptions = questions[currentQuestionIndex].options.filter((_, index) => index !== optionIndex);
        const newQuestions = [...questions];
        newQuestions[currentQuestionIndex].options = newOptions;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (e, index) => {
        const newOptions = [...questions[currentQuestionIndex].options];
        newOptions[index] = e.target.value;
        const newQuestions = [...questions];
        newQuestions[currentQuestionIndex].options = newOptions;
        setQuestions(newQuestions);
    };

    const handleCorrectOptionChange = (index, isChecked) => {
        const newQuestions = [...questions];
        if (!newQuestions[currentQuestionIndex].correctOptions) {
            newQuestions[currentQuestionIndex].correctOptions = [];
        }
        if (moreThanOneCorrect) {
            if (isChecked) {
                newQuestions[currentQuestionIndex].correctOptions.push(index);
            } else {
                newQuestions[currentQuestionIndex].correctOptions = newQuestions[currentQuestionIndex].correctOptions.filter((i) => i !== index);
            }
        } else {
            newQuestions[currentQuestionIndex].correctOptions = isChecked ? [index] : [];
        }
        setQuestions(newQuestions);
    };





    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className='create-multiple-choice-container'>
            <div className={showExit ? 'exit-confirm-container show' : 'exit-confirm-container'}>
                <div className='exit-wrapper'>
                    <img src={questionMark} alt="Question Mark" />
                    <b>Are you sure you <br /> want to exit?</b>
                    <span> All unsaved data will be lost <br /> </span>
                    <div className='ctrl-wrapper'>
                        <button onClick={showLogoutClick} className='btn-1'>Cancel</button>
                        <Link to='/start-page'><button className='btn-2'> Exit</button></Link>
                    </div>
                </div>
            </div>

            <div className={showDelete ? 'exit-confirm-container show' : 'exit-confirm-container'} style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}>
                <div className='exit-wrapper'>
                    <b>Delete</b>
                    <span> Are you sure you want to <br /> delete this item? </span>
                    <div className='ctrl-wrapper'>
                        <button onClick={showDeleteClick} className='btn-1'>Cancel</button>
                        <button className='btn-2' onClick={deleteCurrentQuestion}>Delete</button>
                    </div>
                </div>
            </div>

            <div className='header'>


                <svg className='create-svg' width="593" height="628" viewBox="0 0 593 428" fill="none" xmlns="http://www.w3.org/2000/svg">
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



                <Link onClick={showLogoutClick} className='exit'><FontAwesomeIcon icon={faTimes} /></Link>
                <span className='text-1'>{currentQuestionIndex + 1}/{questions.length}</span>
                <div className='ctrl-wrapper'>

                    <div className='save-wrapper'>

                        <i onClick={saveClick} className='save'><FontAwesomeIcon icon={faSave} /></i>


                        <i className={showSaveCheck ? 'check show' : 'check'}>
                            <FontAwesomeIcon icon={faCheckCircle} />

                        </i>

                    </div>

                    <Link onClick={doneClick} to='/create-quiz/quiz-created'>
                        <button  >Done</button>
                    </Link>
                </div>
            </div>

            <div className='question-wrapper'>
                {/* <input
                    type="text"
                    placeholder='Type your Question Here'
                    value={currentQuestion ? currentQuestion.questionText : ''}
                    onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[currentQuestionIndex].questionText = e.target.value;
                        setQuestions(newQuestions);
                    }}
                /> */}



                <textarea
                    ref={textareaRef}

                    onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[currentQuestionIndex].questionText = e.target.value;
                        setQuestions(newQuestions);
                    }}
                    placeholder={currentQuestion.placeHolder}
                    value={currentQuestion.questionText}
                />




                <i onClick={showDeleteClick}><FontAwesomeIcon icon={faTrash} /></i>
            </div>

            {currentQuestion && currentQuestion.questionType === 1 ?
                <div className='answers-wrapper'>
                    <div className='header'>
                        <label className="label">
                            <input
                                className="label__checkbox"
                                type="checkbox"
                                checked={moreThanOneCorrect}
                                onChange={(e) => setMoreThanOneCorrect(e.target.checked)}
                            />
                            <span className="label__text">
                                <span className="label__check">
                                    <FontAwesomeIcon className="icon" icon={faCheck} />
                                </span>
                            </span>
                        </label>
                        <span>More than one correct answer</span>
                    </div>
                    {currentQuestion.options.map((option, index) => (
                        <div className='item' key={index}>
                            <i className='delete' onClick={() => deleteOption(index)}><FontAwesomeIcon icon={faTrash} /></i>
                            <input
                                type="text"
                                placeholder='Type Choices Here'
                                value={option}
                                onChange={(e) => handleOptionChange(e, index)}
                            />
                            <label className="label">
                                <input
                                    className="label__checkbox"
                                    type="checkbox"
                                    checked={currentQuestion.correctOptions && currentQuestion.correctOptions.includes(index)}
                                    onChange={(e) => handleCorrectOptionChange(index, e.target.checked)}
                                />
                                <span className="label__text">
                                    <span className="label__check">
                                        <FontAwesomeIcon className="icon" icon={faCheck} />
                                    </span>
                                </span>
                            </label>
                            {index === currentQuestion.options.length - 1 && currentQuestion.options.length < 4 && (
                                <i className='add-new' onClick={() => {
                                    const newQuestions = [...questions];
                                    newQuestions[currentQuestionIndex].options.push('');
                                    setQuestions(newQuestions);
                                }}><FontAwesomeIcon icon={faPlus} /></i>
                            )}
                        </div>
                    ))}
                </div>
                :
                <div className='blank-answer-wrapper'>
                    {currentQuestion && currentQuestion.options.map((option, index) => (
                        <div className='item' key={index}>
                            <input
                                type="text"
                                placeholder='Type Answer Here'
                                value={option}
                                onChange={(e) => handleOptionChange(e, index)}
                            />
                        </div>
                    ))}
                </div>
            }


            <div className='page-ctrl-wrapper' onClick={hideSaveCheck}>
                {currentQuestionIndex > 0 && <img className='left' src={LeftArrow} alt="Previous" onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)} />}
                {currentQuestionIndex < questions.length - 1 && <img className='right' src={RightArrow} alt="Next" onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} />}
            </div>

            <div className='footer'>
                <button onClick={addNewQuestionClick}>
                    <i><FontAwesomeIcon icon={faPlus} /></i>
                    <span>Add New Question</span>
                </button>
            </div>
        </div>
    );
}

export default EditQuiz;
