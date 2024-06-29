import React from 'react'
import '../styles/home-page.css';

import questionMark from "../assets/Question.png"

import { BrowserRouter as Router, Route, Routes, Link, } from "react-router-dom";
import axios from 'axios';



function homePage() {
 

    return (
        <div className='home-page-container'>


            <div className='icon-div'>

                <img   src={questionMark} />

                <span>QuizGo!</span>

            </div>

            <form >

                <Link to="/login-page">  <button className='loginBtn'>Log In</button> </Link>
                <Link to="/signup-page">     <button className='signupBtn'>Sign Up</button> </Link>





            </form>



        </div>
    )
}

export default homePage