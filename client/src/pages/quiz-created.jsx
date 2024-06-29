import React from 'react'
import '../styles/quiz-created.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link,useNavigate } from "react-router-dom"; 
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

function QuizCreated() {

    const { user  } = useContext(AuthContext);
    const navigate = useNavigate();
    const [quizTitle, setQuizTitle] = useState(sessionStorage.getItem('quizTitle'))
    const [quizId]= useState(sessionStorage.getItem('quizId'));
 


    useEffect(() => {

        
        if (!user) {

            navigate("/");
        
           
        }

        const mainElement = document.querySelector('.quiz-created-container main');
        mainElement.classList.add('scale-up');
    }, []);




    return (
        <div className='quiz-created-container'>



            <header>


                <span className='text-1'>Created Succesfully!</span>


            </header>

            <main>
                <b>{quizTitle}</b>
              
                <i> <FontAwesomeIcon className='blinking-icon'  icon={faCheck} /> </i>

                <span>You have succesfully
                    <br /> created {quizTitle}.
                </span>



            </main>


            <div className='btn-wrapper'>

            <Link to={`/answer-quiz/${quizId}`}>    <button className='start-Button'>Play Quiz</button></Link>
                <Link to="/start-page">     <button className='exit-Button'>Exit</button></Link>


            </div>



        </div>
    )
}

export default QuizCreated



