import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useLocation, Link ,useNavigate } from 'react-router-dom';
import Fill from '../assets/fill.png'
import Multi from '../assets/multiple.jpg'
import '../styles/select-type.css';

function SelectType() {
    const location = useLocation();
    const { myData } = location.state || {};
    const { nextNumber } = location.state || {};
    const [addQuestion, setAddQuestion] = useState(false);
    const { user  } = useContext(AuthContext);
    const navigate = useNavigate();
    useEffect(() => {

        if (!user) { 
            navigate("/"); 
        }

        if (myData === 'addQuestion') {
            setAddQuestion(true);
        }
    }, [myData]);

    const questionTypeCLick = (val) => {
        // Get existing questions from session storage or initialize an empty array
        const questions = JSON.parse(sessionStorage.getItem('questions')) || [];


        var questionNumber;
        if (questions.length < 1) {
            questionNumber = questions.length + 1;
            console.log('etoo');
        } else {
            console.log('etoosss');
            questionNumber = nextNumber + 1;
        }
        // Determine the question number/index based on the existing questions
        // This will be the new question number

        // Create a new question object
        const newQuestion = {
            questionNumber, // Assign the question number
            questionType: val, // Assign the question type (1 for Multiple Choice, 2 for Fill in the Blank)
            questionText: '', // Initialize the question text (you may set a default or leave empty)
            placeHolder:'Type your Question Here',
            options: [" "], // Initialize options array (if needed)
            questionId: null ,// Initialize selected option (if needed)
            correctOptions:[0]
        };

        console.log(newQuestion);


        


        // Add the new question to the questions array
        questions.splice(questionNumber, 0, newQuestion);

        // Update session storage with the updated questions array
        sessionStorage.setItem('questions', JSON.stringify(questions));

        // Set the question type in session storage
        sessionStorage.setItem('questionType', val);

            
        if(nextNumber===undefined){

            sessionStorage.setItem('nextNumber',0);

        }else{
            sessionStorage.setItem('nextNumber',nextNumber+1);
        }
   

    };


    const testCLick = () => {

        console.log('index:', nextNumber);

    }




    return (
        <div className='select-type-container'>
            <Link to={addQuestion ? '/create-quiz/multiple-choice' : '/create-quiz'} className='exit'>
                <FontAwesomeIcon icon={faTimes} />
            </Link>
            <div className='select-type-wrapper'>

                <b onClick={testCLick} >Please Select Type of <br />
                    Question</b>

                <Link to='/create-quiz/multiple-choice' onClick={() => questionTypeCLick(1)}>
                    <div className='item-1'>

                        <img src={Multi} alt="" />
                        <span>

                            Multiple Choice

                        </span>




                    </div></Link>

                <Link to='/create-quiz/multiple-choice' onClick={() => questionTypeCLick(2)}>
                    <div className='item-2'>

                        <img src={Fill} alt="" />
                        <span>

                            Fill in the Blank

                        </span>




                    </div>
                </Link>

            </div>
        </div>
    );
}

export default SelectType;
