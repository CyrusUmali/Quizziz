import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faExclamation, faPlay, faPause, faPlus, faRefresh, faTimes, faTrash, faEye, faSearch } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import '../styles/quizzes.css';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, useParams, Link, } from "react-router-dom";
import QuestionMark from '../assets/Question.png';
import Flask from '../assets/flask.png';

function Quizzes() {
  const { user } = useContext(AuthContext);
  const { categoryId } = useParams();
  const [quizTitle, setQuizTitle] = useState(sessionStorage.getItem('quizTitle'));
  const [quizCategName, setQuizCateName] = useState(sessionStorage.getItem('quizCategName'));
  const [quizzes, setQuizzes] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [showRestart, setShowRestart] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState(null);

  const [searchValue, setSearchValue] = useState();

  const handleSearchInput = (e) => {

    setSearchValue(e.target.value)

  }


  const handleSearchSubmit = (event) => {

    if (event.key === 'Enter') {
      console.log('searchValue', searchValue);



      // Fetch updated quizzes list
      axios.get(`http://localhost:3001/auth/search-quizzes/${categoryId}/${user.id}`, {

        params: {
          searchTerm: searchValue
        } 
      })
        .then(response => {
          setQuizzes(response.data.quizzes); // Update quizzes state with new data
        })
        .catch(error => {
          console.log(error.message || 'Something went wrong');
        });



      // Handle the enter key event here
    }

  }


  const showDeleteClick = (quizId) => {
    setShowDelete(!showDelete);
    console.log('quizId', quizId);
    setCurrentQuizId(quizId)
  };

  const showRestartCLick = (quizId) => {
    setShowRestart(!showRestart);
    console.log('quizId', quizId);
    setCurrentQuizId(quizId)
  };




  const deleteQuiz = () => {

    console.log('currentQuizId:', currentQuizId);

    axios.delete(`http://localhost:3001/auth/delete-quiz/${currentQuizId}`)
      .then(response => {
        if (response.data.success) {
          console.log(response.data.message);

          setShowDelete(!showDelete);



          // Fetch updated quizzes list
          axios.get(`http://localhost:3001/auth/quizzes/${categoryId}/${user.id}`)
            .then(response => {
              setQuizzes(response.data.quizzes); // Update quizzes state with new data
            })
            .catch(error => {
              console.log(error.message || 'Something went wrong');
            });



          // Perform any additional actions, such as updating the UI
        } else {
          console.error('Failed to delete the quiz.');
        }
      })
      .catch(error => {
        console.error('Error deleting the quiz:', error);
      });


  }
  const navigate = useNavigate();

  const editClick = (quizId) => {

    console.log('quizId', quizId);

    axios.get(`http://localhost:3001/auth/questions/edit/${quizId}`)
      .then(response => {


        console.log(response)
        sessionStorage.setItem('questions', JSON.stringify(response.data.questions));
        sessionStorage.setItem('nextNumber', 0)
        navigate(`/edit-quiz/${quizId}`)
      })
      .catch(error => {
        console.log(error.message || 'Something went wrong');
      });

    // navigate(`/edit-quiz/${quizId}`)


  }

  const restartQuiz = () => {

    console.log('currentQuizId:', currentQuizId);
    console.log("userId:", user.id);




    axios.delete(`http://localhost:3001/auth/questions/${currentQuizId}/${user.id}`)
      .then(response => {
        if (response.data.success) {
          console.log(response.data.message);
          setShowRestart(!showRestart);

          // Fetch updated quizzes list
          axios.get(`http://localhost:3001/auth/quizzes/${categoryId}/${user.id}`)
            .then(response => {
              setQuizzes(response.data.quizzes); // Update quizzes state with new data
            })
            .catch(error => {
              console.log(error.message || 'Something went wrong');
            });
          // Perform any additional actions, such as updating the UI
        } else {
          console.error('Failed to delete the quiz.');
        }
      })
      .catch(error => {
        console.error('Error deleting the quiz:', error);
      });

  }





  useEffect(() => {
    axios.get(`http://localhost:3001/auth/quizzes/${categoryId}/${user.id}`)
      .then(response => {
        console.log('categId:', categoryId);
        console.log('quizzes:', response.data.quizzes);
        setQuizzes(response.data.quizzes);
      })
      .catch(error => {
        console.log(error.message || 'Something went wrong');
      });
  }, [categoryId]);

  return (
    <div className='quizzes-container'>
      <div className='header'>
        <Link to='/play-quiz'>
          <FontAwesomeIcon style={{ color: 'white' }} className='back' icon={faArrowLeft} />
        </Link>
        <img src={Flask} alt="" />
        <span>
          {quizCategName ? quizCategName : 'Category Name'}
        </span>
      </div>


      <div className={showDelete ? 'exit-confirm-container show' : 'exit-confirm-container'} style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}>
        <div className='exit-wrapper'>
          <b>Delete</b>
          <span> Are you sure you want to <br /> delete this item? </span>
          <div className='ctrl-wrapper'>
            <button onClick={showDeleteClick} className='btn-1'>Cancel</button>
            <button className='btn-2' onClick={deleteQuiz}>Delete</button>
          </div>
        </div>
      </div>



      <div className={showRestart ? 'exit-confirm-container show' : 'exit-confirm-container'} style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}>
        <div className='exit-wrapper'>
          <b>Restart Progress</b>
          <span> Are you sure you want to <br /> Restart this Quiz? </span>
          <div className='ctrl-wrapper'>
            <button onClick={showRestartCLick} className='btn-1'>Cancel</button>
            <button className='btn-2' onClick={restartQuiz}>Restart</button>
          </div>
        </div>
      </div>



      <div className='search-container'>

        <FontAwesomeIcon icon={faSearch} />
        <input type="text" onChange={handleSearchInput} onKeyDown={handleSearchSubmit} />

      </div>



      <div className='quizzes-wrapper'>
        {quizzes.map(quiz => (
          <div className='item' key={quiz.quiz_id}>
            <div className='head'>
              <img src={QuestionMark} alt='' />
              <div className='text-wrapper'>{quiz.question_count} Qs</div>
            </div>
            <div className='body'>
              <div className='left'>
                <span className='title'>{quiz.quiz_name}</span>
                {quiz.answered_count > 0 && (
                  <div className='progress-bar'>
                    <span className='bar' style={{ width: `${(quiz.answered_count / quiz.question_count) * 100}%` }}></span>
                    <span className='text'>
                      {quiz.question_count - quiz.answered_count} Questions Remaining
                    </span>
                  </div>
                )}
              </div>
              <div className='right'>
                {quiz.answered_count > 0 ? (
                  <FontAwesomeIcon onClickCapture={() => showRestartCLick(quiz.quiz_id)} className='icon-1' icon={faRefresh} />
                ) : (
                  <span className='icon-placeholder' />
                )}



                {quiz.answered_count === quiz.question_count ? (
                  <Link to={`/answer-quiz/quiz-result/${quiz.quiz_id}`}>
                    <FontAwesomeIcon className='icon-1' style={{ marginLeft: '6px' }} icon={faEye} />
                  </Link>
                ) : (
                  <Link to={`/answer-quiz/${quiz.quiz_id}`}>
                    <FontAwesomeIcon className='icon-1' style={{ marginLeft: '6px' }} icon={quiz.answered_count === 0 ? faPlay : faPause} />
                  </Link>
                )}





                <FontAwesomeIcon className='icon' onClick={() => showDeleteClick(quiz.quiz_id)} icon={faTrash} />


                <FontAwesomeIcon onClick={() => editClick(quiz.quiz_id)} className='icon' icon={faEdit} />

              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='footer'>
        <Link to='/create-quiz'>
          <FontAwesomeIcon className='add' icon={faPlus} />
        </Link>
      </div>
    </div>
  );
}

export default Quizzes;
