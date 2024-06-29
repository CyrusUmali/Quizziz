import React, { useEffect } from 'react';
import '../styles/acc-created.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { faCheck } from '@fortawesome/free-solid-svg-icons';

function AccCreatedPage() {
    useEffect(() => {
        const mainElement = document.querySelector('.acc-created-container main');
        mainElement.classList.add('scale-up');
    }, []);

    return (
        <div className='acc-created-container'>
            <header>
                {/* <svg className='acc-created-svg' 
                     width="378" height="222" viewBox="0 0 378 222" fill="royalblue" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 221C227.756 230.924 344.111 185.204 377.5 55.5V1H1V221Z" />
                </svg> */}


                <svg className='acc-created-svg'   width="378" height="222" viewBox="0 0 378 222"fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgb(0,91,255)" stopOpacity="1" />
                            <stop offset="100%" stopColor="rgb(87,147,255)" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M1 221C227.756 230.924 344.111 185.204 377.5 55.5V1H1V221Z"
                        fill="url(#grad1)"
                    />
                </svg>




                <Link to="/">
                    <button>Done</button>
                </Link>
            </header>

            <main>
                <b>Congratulations!</b>
                <i>
                    <FontAwesomeIcon icon={faCheck} className="blinking-icon" />
                </i>
                <span>Your account has been
                    <br /> created successfully.
                </span>
            </main>

            <Link to="/">
                <button className='start-Button'>Let's Start!</button>
            </Link>
        </div>
    );
}

export default AccCreatedPage;
