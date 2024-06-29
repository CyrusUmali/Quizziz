import React, { useEffect, useContext, useState } from 'react';
import '../styles/start-page.css';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import questionMark from "../assets/Question.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCog, faDoorOpen, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import Loading from './loading'
function StartPage() {
    const { user, logout } = useContext(AuthContext);
    const [menuClick, setMenuClick] = useState(false);
    const [showLogout, setShowLogout] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // Loading state
    const testClick =()=>{
        console.log('user',user);
    }

    const handleMenuClick = () => {
        setMenuClick(!menuClick);
    };

    const showLogoutClick = () => {
        setShowLogout(!showLogout);
    };

    useEffect(() => {

        sessionStorage.removeItem('questions');
        localStorage.removeItem('showSetting');

        if (!user) {

            setLoading(true);
              
            console.log('user',user);

            setTimeout(() => {
                setLoading(false); // Stop loading after delay
                navigate("/");
              }, 1000); // Simulated delay of 1 second
            
        }
    }, [user, navigate]);

    if (!user) {
        return <Loading />; // Return null or a loading spinner, or navigate to another page
    }

    return (
        <div className='start-page-container'>

{loading ? <Loading /> : ''}


            <div className={showLogout ? 'logout-confirm-container show' : 'logout-confirm-container'}>
                <div className='logout-wrapper'>
                    <img src={questionMark} alt="Question mark" />
                    <b>Log Out</b>
                    <span>Are you sure you want to <br /> log out?</span>
                    <div className='ctrl-wrapper'>
                        <button className='btn-1' onClick={showLogoutClick}>Cancel</button>
                        <button className='btn-2' onClick={logout}>Log Out</button>
                    </div>
                </div>
            </div>
            <i className='menu-btn'>
                <FontAwesomeIcon icon={menuClick ? faTimes : faBars} onClick={handleMenuClick} />
            </i>
            <div className={menuClick ? 'menu-options show' : 'menu-options'}>
                <div className='row-a'>
                    <div className='part-a'>
                        <img src="" alt="" />
                        <i> <FontAwesomeIcon icon={faPlus} /></i>
                    </div>
                    <div className='part-b'>
                        <b> Welcome, {user.firstName} {user.lastName} </b>
                        <span> {user.email}</span>
                    </div>
                </div>
                <div className='row-b'>
                    <div className='item'>
                        <i> <FontAwesomeIcon icon={faCog} /></i>
                        <span>Settings</span>
                    </div>
                    <div className='item'>
                        <i> <FontAwesomeIcon icon={faDoorOpen} /></i>
                        <span onClick={showLogoutClick}>Logout</span>
                    </div>
                </div>
            </div>
            <div className='icon-div'>
                <img src={questionMark} alt="Question mark" />
                <span onClick={testClick}>QuizGo!</span>
            </div>
            <form>
                <Link to="/play-quiz">
                    <button className='loginBtn'>Play Quiz</button>
                </Link>
                <Link to="/create-quiz">
                    <button className='signupBtn'>Create Quiz</button>
                </Link>
            </form>
        </div>
    );
}

export default StartPage;
