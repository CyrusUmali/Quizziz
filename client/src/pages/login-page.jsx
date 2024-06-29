

import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faExclamation } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';
import '../styles/login-page.css';
import { BrowserRouter as Router, Route, Routes, Link, } from "react-router-dom";
import axios from 'axios' 
import { AuthContext } from '../AuthContext';
import Loading from './loading'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
function LoginPage() {
  const [showError, setShowError] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login } = useContext(AuthContext);
  const [errorText, setErrorText] = useState('An Error has Occured');
  const [loading, setLoading] = useState(false); // Loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };



  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };

  const logInCLick = async (e) => {


    e.preventDefault();

    setLoading(true);


    const result = await login(formData.email, formData.password);
    if (result.success) {

      setTimeout(() => {
        setLoading(false); // Stop loading after delay
        navigateTo('/start-page');
      }, 1000); // Simulated delay of 1 second


    } else {
      setLoading(false);
      setErrorText('Invalid Email or Password')
      setShowError(true);
    }

  }


  const { loginWithGoogle } = useContext(AuthContext);

  const handleGoogleLoginSuccess = (credentialResponse) => {

    setLoading(true)
    const { credential } = credentialResponse; // Extract Google ID token
    loginWithGoogle(credential)
      .then((response) => {
        if (response.success) {


          setTimeout(() => {
            setLoading(false); // Stop loading after delay

            navigateTo('/start-page');
          }, 1000); // Simulated delay of 1 second

        } else {
          setLoading(false);
          // console.error('Google login failed:', response.message);
          setShowError(true);
          setErrorText('User not Registered')
          // Handle Google login failure (show error message, etc.)
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error logging in with Google:', error);
        // Handle unexpected errors during Google login
      });
  };

  const handleGoogleLoginError = () => {
    console.log('Google login failed');
    // Handle Google login failure
  };



  return (
    <div className='login-page-container'>
      {loading ? <Loading /> : ''}

      <header>



      <svg className='login-svg' width="377" height="244" viewBox="0 0 377 244" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(0,91,255)" stopOpacity="1" />
          <stop offset="100%" stopColor="rgb(87,147,255)" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path 
        d="M1 242.5C88.5007 243.149 117.425 224.567 150.5 174C168.961 142.077 182.451 139.118 207 142C291.185 143.352 326.395 124.994 376.5 72V1H1V242.5Z" 
        fill="url(#grad1)" 
      />
    </svg>




        <Link to='/'>  <i> <FontAwesomeIcon icon={faArrowLeft} /> </i> </Link>
        <span className='text-1'>Welcome Back,</span>
        <span className='text-2'>Log In!</span>
      </header>

      <form>



        <div className='row'>
          <div className='item'>
            <span
              className={showError ? 'warning-wrapper show' : 'warning-wrapper'}
            // className={`warning-wrapper ${errors.confirmPassword ? 'show' : ''}`}
            >
              <i> <FontAwesomeIcon icon={faExclamation} /> </i>
              <label>{errorText}</label>
            </span>


          </div>
        </div>


        <div className='row'>
          <div className='item'>
            <label>Email</label>
            <input
              type='email'
              id='EmailInput'
              name='email'
              placeholder='e.g.johnsmith@email.com'
              value={formData.email}
              onChange={handleChange}
            />

          </div>
        </div>

        <div className='row'>
          <div className='item'>
            <label  >Password</label>
            <input
              type='password'
              id='PasswordInput'
              name='password'
              value={formData.password}
              onChange={handleChange}
            />

          </div>
        </div>

        <div className='row'>
          <div className='item' style={{
            display: "flex", flexDirection: "row", justifyContent: "start",
            margin: "15px 0px", alignItems: 'center'
          }}>
            <input
              type='checkbox'
              id='signupAgreementCheckbox'
              name='agreeToTerms'
            // checked={formData.agreeToTerms}
            // onChange={handleChange}
            // style={{ accentColor: checkboxColor }}
            />
            <label style={{ fontSize: "14px", whiteSpace: 'nowrap' }}>
              Remember me
            </label>

            <Link><span className='forgot-password'>Forgot Password?</span></Link>
          </div>
        </div>







        <button onClick={logInCLick} >Log In</button>
      </form>

      <div className='login-alternatives'>

        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={handleGoogleLoginError}
        />

        <span>Don't have an account? <Link to="/signup-page">SIGN UP</Link></span>
      </div>
    </div>
  )
}

export default LoginPage