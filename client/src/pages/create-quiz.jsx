import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faExclamation, faL, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare, faGoogle } from '@fortawesome/free-brands-svg-icons';
import '../styles/create-quiz.css';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";

import Art from '../assets/art.png'
import Science from '../assets/science.png'
import SocialStudies from '../assets/socialstudies.png'
import Technology from '../assets/technology.png'
import Sports from '../assets/sports.png'
import Math from '../assets/math.png'
import axios from 'axios'


const apiUrl = import.meta.env.VITE_API_URL;

function CreateQuiz() {

    const { user, logout } = useContext(AuthContext);
    const [showQuizTitle, setShowQuizTitle] = useState(false);
    const [quizTitle, setQuizTitle] = useState(null)
    const [quizCateg, setQuizCateg] = useState(false);
    const [quizCounts, setQuizCounts] = useState([
        { quizCount: 0 }, // Category 1
        { quizCount: 0 }, // Category 2
        { quizCount: 0 }, // Category 3
        { quizCount: 0 }, // Category 4
        { quizCount: 0 }, // Category 5
        { quizCount: 0 }
    ]);
    const [titleError, setTitleError] = useState(false);


    const navigate = useNavigate();

    const categClick = (categId) => {
        setShowQuizTitle(!showQuizTitle);
        console.log('categlicks');
        setQuizCateg(categId)
        sessionStorage.setItem('quizCategory', categId)

    }


    const handleChange = (event) => {
        setQuizTitle(event.target.value); // Update quizTitle state with the new value from input
    };

    const doneCLick = () => {

        if (quizTitle === null) {
            console.log('asdas');
            setTitleError(true);
            return;
        }

        sessionStorage.setItem('quizTitle', quizTitle)




        const postData = {
            quizTitle,
            quizCategory: quizCateg
        };

        // Send POST request to save the quiz
        axios.post(`${apiUrl}/auth/save-quiz`, postData)
            .then(response => {

                console.log('Quiz saved successfully!');
                console.log('Quiz ID:', response.data.quizId); // Assuming server sends back quizId
                sessionStorage.setItem("quizId", response.data.quizId);

                navigate('/create-quiz/select-type')

            })
            .catch(error => {
                // Handle error
                console.error('Error saving quiz:', error);
            });


    }

    const testCLick = () => {
        console.log("quizcount:", quizCounts[0].quizCount)
    }



    useEffect(() => {

        sessionStorage.removeItem('questions');

        if (!user) {

            navigate("/");
            // const inputborder = document.getElementById('quizTitleInput');

            // inputborder.classList.add('error');


        }

        axios.get(`${apiUrl}/auth/count-quizzes`)
            .then((response) => {
                if (response.data.success) {

                    console.log('Data:', response.data)
                    setQuizCounts(response.data.counts);

                } else {
                    alert("Error . Please try again.");
                }
            })
            .catch((error) => {
                console.error('Error :', error);
                alert("Error   Please try again.");
            });




    }, [user, navigate]);

    if (!user) {
        return null; // Return null or a loading spinner, or navigate to another page
    }


    return (
        <div className='create-quiz-container'>

            <header>


                <svg className='create-quiz-svg' width="377" height="178" viewBox="0 0 377 178" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1H376V50C386.728 50.5407 332.799 122.4 271.5 126C210.201 129.6 191.085 121.257 145 134.183C89.4298 149.77 77.6411 172.57 1 177V1Z" fill="royalblue" />
                </svg>




                <i>   <Link className='back' to='/start-page'> <FontAwesomeIcon icon={faArrowLeft} /> </Link>  </i>

                <span className='text-1' onClick={testCLick}>Hi, <span className='text-2'>{user.firstName}</span> </span>

                <span className='text-3'>Let's make learning fun and <br /> exciting!</span>
            </header>

            <div className={showQuizTitle ? 'quiz-title-container show' : 'quiz-title-container'}>

                <div className='quiz-title-wrapper'>

                    <i onClick={categClick}> <FontAwesomeIcon icon={faTimes} /> </i>

                    <span>Title of the Quiz</span>

                    <input
                        className={titleError ? 'titleInp error' : 'titleInp '}
                        type="text"
                        id='quizTitleInput'
                        name='quizTitle'
                        value={quizTitle}
                        onChange={handleChange}
                    />


                    <button onClick={doneCLick}>Done</button>

                </div>

            </div>


            <div className='quiz-category-container'>

                <div className='header'>
                    <span className='text-1'>
                        Let's Create!
                    </span>

                    <span className='text-2'>
                        Please Select Category
                    </span>
                </div>

                <div className='category-wrapper'>

                    <div className='item' onClick={() => categClick(1)}>

                        <img src={Science} alt="" style={{ height: '95px', width: '95px', top: '0px' }} />

                        <span className='text-1' >Science</span>
                        <span className='text-2'> {quizCounts[0].quizCount} Quiz</span>

                    </div>

                    <div className='item' onClick={() => categClick(2)}>

                        <img src={Math} alt="" style={{ height: '125px', width: '125px' }} />

                        <span className='text-1'>Math</span>
                        <span className='text-2'>{quizCounts[1].quizCount}  Quiz</span>

                    </div>

                    <div className='item' onClick={() => categClick(3)}>

                        <img src={SocialStudies} style={{ height: '125px', width: '125px', top: '-20px' }} />

                        <span className='text-1'>Social Studies</span>
                        <span className='text-2'>{quizCounts[2].quizCount} Quiz</span>

                    </div>



                    <div className='item' onClick={() => categClick(4)}>

                        <img src={Art} alt="" style={{ height: '90px', width: '90px', top: '0px' }} />

                        <span className='text-1'>Arts</span>
                        <span className='text-2'>{quizCounts[3].quizCount} Quiz</span>

                    </div>

                    <div className='item' onClick={() => categClick(5)}>

                        <img src={Technology} style={{ height: '95px', width: '95px', top: '0px' }} />

                        <span className='text-1'>Technology  </span>
                        <span className='text-2'>{quizCounts[4].quizCount} Quiz</span>

                    </div>

                    <div className='item' onClick={() => categClick(6)}>

                        <img src={Sports} style={{ height: '75px', width: '75px', top: '10px' }} />

                        <span className='text-1'>Sports  </span>
                        <span className='text-2'>{quizCounts[5].quizCount} Quiz</span>

                    </div>



                </div>

            </div>



        </div>
    )
}

export default CreateQuiz