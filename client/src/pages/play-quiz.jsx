
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faExclamation, faL, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';
import '../styles/create-quiz.css';
import { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, } from "react-router-dom";
import { AuthContext } from '../AuthContext';
import Art from '../assets/art.png'
import Science from '../assets/science.png'
import SocialStudies from '../assets/socialstudies.png'
import Technology from '../assets/technology.png'
import Sports from '../assets/sports.png'
import Math from '../assets/math.png'
import axios from 'axios'
function PlayQuiz() {








    const { user, logout } = useContext(AuthContext);
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


    const navigate = useNavigate();

    const categClick = (categId) => {

        var CategName;


        switch (categId) {

            case 1: CategName = "Science"; break;
            case 2: CategName = "Math"; break;
            case 3: CategName = "Social Studies"; break;
            case 4: CategName = "Arts"; break;
            case 5: CategName = "Technology"; break;
            case 6: CategName = "Sports"; break;
            default: break;


        }

        sessionStorage.setItem('quizCategName',CategName);

        console.log('categlicks');
        sessionStorage.setItem('quizCategory', categId)


        navigate(`/play-quiz/quizzes/${categId} `)

    }


    const handleChange = (event) => {
        setQuizTitle(event.target.value); // Update quizTitle state with the new value from input
    };

    const doneCLick = () => {

        sessionStorage.setItem('quizTitle', quizTitle)




        const postData = {
            quizTitle,
            quizCategory: quizCateg
        };

        // Send POST request to save the quiz
        axios.post('http://localhost:3001/auth/save-quiz', postData)
            .then(response => {

                console.log('Quiz saved successfully!');
                console.log('Quiz ID:', response.data.quizId); // Assuming server sends back quizId
                sessionStorage.setItem("quizId", response.data.quizId);

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
        }

        axios.get('http://localhost:3001/auth/count-quizzes')
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


            <svg style={{top:'-10px'}} className='create-quiz-svg' width="377" height="178" viewBox="0 0 377 178" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1H376V50C386.728 50.5407 332.799 122.4 271.5 126C210.201 129.6 191.085 121.257 145 134.183C89.4298 149.77 77.6411 172.57 1 177V1Z"   fill="royalblue" />
                </svg>

                <i>   <Link className='back' to='/start-page'> <FontAwesomeIcon icon={faArrowLeft} /> </Link>  </i>

                <span className='text-1'>Hi, <span className='text-2'>{user.firstName}</span> </span>

                <span className='text-3'>Let's make this day productive</span>
            </header>




            <div style={{marginTop:'22px'}} className='quiz-category-container'>

                <div className='header'>
                    <span className='text-1'>
                        Let's Play!
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

export default PlayQuiz


