import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faExclamation } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import '../styles/signup-page.css';
import { jwtDecode } from 'jwt-decode';
import Loading from './loading'

const apiUrl = import.meta.env.VITE_API_URL;



function SignupPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });
    const [showPasswordInfo, setShowPasswordInfo] = useState(false);
    const [errors, setErrors] = useState({});
    const [checkboxColor, setCheckboxColor] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const navigate = useNavigate();

    const navigateTo = (path) => {
        navigate(path);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const passwordClick = () => {
        setShowPasswordInfo(!showPasswordInfo);
    };

    const validateForm = () => {
        let formErrors = {};

        if (!formData.firstName) formErrors.firstName = 'Please fill out this form.';
        if (!formData.lastName) formErrors.lastName = 'Please fill out this form.';
        if (!formData.email) formErrors.email = 'Please fill out this form.';
        if (!formData.password) formErrors.password = 'Please fill out this form.';
        if (formData.password !== formData.confirmPassword) formErrors.confirmPassword = 'Password Confirmation does not match.';
        if (!formData.agreeToTerms) formErrors.agreeToTerms = 'You must agree to the terms and conditions.';

        const password = formData.password;
        const passwordValidation = [
            { regex: /.{8,}/, message: 'At least eight (*) characters or more.' },
            { regex: /[a-z]/, message: 'At least one (1) lower case letter (e.g. a, b, c).' },
            { regex: /[A-Z]/, message: 'At least one (1) upper case letter (e.g. A, B, C).' },
            { regex: /[0-9]/, message: 'At least one (1) number.' },
            { regex: /[^a-zA-Z0-9]/, message: 'At least one (1) symbol (e.g. $, %, ^).' }
        ];

        passwordValidation.forEach(({ regex, message }) => {
            if (!regex.test(password)) {
                formErrors.password = formErrors.password ? `${formErrors.password}\n${message}` : message;
            }
        });

        setErrors(formErrors);

        return Object.keys(formErrors).length === 0;
    };

    const signUpClick = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true); // Start loading
            axios.post(`${apiUrl}/auth/register`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password
            })
                .then((response) => {
                    console.log(response.data);
                    if (response.data.success) {
                        setTimeout(() => {
                            setLoading(false); // Stop loading after delay
                            navigateTo('/acc-created');
                        }, 1000); // Simulated delay of 1 second
                    } else {
                        setLoading(false); // Stop loading on failure
                        alert(response.data.message || "Registration failed.");
                    }
                })
                .catch((error) => {
                    setLoading(false); // Stop loading on failure
                    console.error("There was an error registering:", error);
                    alert("An error occurred during registration. Please try again later.");
                });
        } else {
            if (!formData.agreeToTerms) {
                setCheckboxColor('orangered');
            }
            console.log('Form has errors. Please fix them before submitting.');
        }
    };


    const googlelogin = useGoogleLogin({
        onSuccess: async tokenResponse => {
            setLoading(true); // Start loading
            console.log(tokenResponse);
            const userInfo = await axios
                .get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                })
                .then(res => res.data);

            axios.post(`${apiUrl}/auth/google`, {
                sub: userInfo.sub,
                email: userInfo.email,
                firstname: userInfo.given_name,
                lastname: userInfo.family_name,

            })
                .then((response) => {
                    console.log(response.data);
                    if (response.data.success) {
                        setTimeout(() => {
                            setLoading(false); // Stop loading after delay
                            navigateTo('/acc-created');
                        }, 1000); // Simulated delay of 1 second
                    } else {
                        setLoading(false); // Stop loading on failure
                        alert(response.data.message || "Registration failed User Already Exists.");
                    }
                })
                .catch((error) => {
                    setLoading(false); // Stop loading on failure
                    console.error("There was an error registering:", error);
                    alert("An error occurred during registration. Please try again later.");
                });
        }
    });



    return (
        <div className='signup-page-container'>


            {loading ? <Loading /> : ''}



            <header>
                <svg className='signup-svg' width="377" height="244" viewBox="0 0 377 244" fill="none" xmlns="http://www.w3.org/2000/svg">
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

                <Link to='/'><i><FontAwesomeIcon icon={faArrowLeft} /></i></Link>
                <span className='text-1'>Hello,</span>
                <span className='text-2'>Sign Up!</span>
            </header>

            <form>
                <div className='row'>
                    <div className='item'>
                        <label>First Name</label>
                        <input
                            type="text"
                            id='FirstNameInput'
                            name='firstName'
                            placeholder='John'
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        <span className={`warning-wrapper ${errors.firstName ? 'show' : ''}`}>
                            <i><FontAwesomeIcon icon={faExclamation} /></i>
                            <label>{errors.firstName}</label>
                        </span>
                    </div>
                    <div className='item'>
                        <label>Last Name</label>
                        <input
                            type="text"
                            id='LastNameInput'
                            name='lastName'
                            placeholder='Smith'
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                        <span className={`warning-wrapper ${errors.lastName ? 'show' : ''}`}>
                            <i><FontAwesomeIcon icon={faExclamation} /></i>
                            <label>{errors.lastName}</label>
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
                        <span className={`warning-wrapper ${errors.email ? 'show' : ''}`}>
                            <i><FontAwesomeIcon icon={faExclamation} /></i>
                            <label>{errors.email}</label>
                        </span>
                    </div>
                </div>

                <div className='row'>
                    <div className='item'>
                        <label onClick={passwordClick}>Password</label>
                        <input
                            type='password'
                            id='PasswordInput'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <span className={`warning-wrapper ${errors.password ? 'show' : ''}`}>
                            <i><FontAwesomeIcon icon={faExclamation} /></i>
                            <label>{errors.password}</label>
                        </span>
                    </div>
                </div>

                <div className={showPasswordInfo ? 'info-block show' : 'info-block'}>
                    <b>Password must contain:</b>
                    <ul>
                        <li>At least eight (*) characters or more.</li>
                        <li>At least one (1) lower case letter (e.g. a, b, c).</li>
                        <li>At least one (1) upper case letter (e.g. A, B, C).</li>
                        <li>At least one (1) number.</li>
                        <li>At least one (1) symbol (e.g. $, %, ^).</li>
                    </ul>
                </div>

                <div className='row'>
                    <div className='item'>
                        <label>Confirm Password</label>
                        <input
                            type='password'
                            id='ConfirmPasswordInput'
                            name='confirmPassword'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        <span className={`warning-wrapper ${errors.confirmPassword ? 'show' : ''}`}>
                            <i><FontAwesomeIcon icon={faExclamation} /></i>
                            <label>{errors.confirmPassword}</label>
                        </span>
                    </div>
                </div>

                <div className='row'>
                    <div className='item' style={{ display: "flex", flexDirection: "row", justifyContent: "start" }}>
                        <input
                            type='checkbox'
                            id='signupAgreementCheckbox'
                            name='agreeToTerms'
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            style={{ accentColor: checkboxColor }}
                        />
                        <label style={{ fontSize: "12px", color: checkboxColor }}>
                            By signing up you agree to our privacy policy, user terms, and conditions.
                        </label>
                    </div>
                </div>

                <button onClick={signUpClick}>Sign Up</button>
            </form>

            <div className='signup-alternatives'>
                <span>or Sign Up with</span>
                <div className='item-wrapper'>
                    <i onClick={() => googlelogin()}><FontAwesomeIcon icon={faGoogle} /></i>
                    {/* <i><FontAwesomeIcon icon={faFacebookSquare} /></i> */}
                </div>
                <span>Already have an account? <Link to="/login-page">LOG IN</Link></span>
            </div>
        </div>
    );
}

export default SignupPage;
