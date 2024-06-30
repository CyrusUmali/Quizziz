const express = require('express');
const db = require("../connect");
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('460297050109-vg8lujpfnftm1bafbqsur8drtiv8tdic.apps.googleusercontent.com');
const authenticateToken = require('../middleware/authenticateToken');
// const { register } = require('../controllers/auth'); 

const router = express.Router();

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "All Fields Required." });
  }

  const sql = `INSERT INTO users (firstname, lastname , email , password) VALUES (?, ? , ? ,?)`;

  db.query(sql, [firstName, lastName, email, password], (err, result) => {
    if (err) {
      console.error("Error inserting data into the database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.status(200).json({ success: true, message: "Data added successfully" });
  });
});

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All Fields Required." });
  }

  const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const user = results[0];
    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname,
        // Add other fields as needed
      },
      'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    res.status(200).json({ success: true, message: "Login successful", token });
  });
});



// Google OAuth registration endpoint
router.post('/google', async (req, res) => {
  const { sub, email, firstname, lastname } = req.body;

  if (!sub || !email || !firstname || !lastname) {
    return res.status(400).json({ error: "All Fields Required." });
  }

  const checkUserSql = `SELECT * FROM users WHERE google_id = ? OR email = ?`;
  db.query(checkUserSql, [sub, email], (err, result) => {
    if (err) {
      console.error("Error checking user in the database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.length > 0) {
      return res.status(200).json({ success: false, error: "User already exists." });
    }



    const sql = `INSERT INTO users (google_id, email, firstname, lastname) VALUES (?, ?, ?, ?)`;

    db.query(sql, [sub, email, firstname, lastname], (err, result) => {
      if (err) {
        console.error("Error inserting data into the database:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.status(200).json({ success: true, message: "Google user added successfully" });
    });
  });
});

router.post('/google/login', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "Google ID Token (idToken) is required." });
  }

  try {
    // Verify Google ID token using Google OAuth library
    const ticket = await client.verifyIdToken({
      idToken,
      audience: '460297050109-vg8lujpfnftm1bafbqsur8drtiv8tdic.apps.googleusercontent.com', // Replace with your actual Google Client ID
    });

    const payload = ticket.getPayload();
    const googleUserId = payload.sub; // Google ID (sub)

    // Check if user exists in database based on googleUserId (sub)
    const sql = `SELECT * FROM users WHERE google_id = ?`;
    db.query(sql, [googleUserId], (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found." });
      }

      // User found, generate JWT token with additional user information
      const user = results[0];
      const token = jwt.sign(
        {
          id: user.user_id,
          email: user.email,
          firstName: user.firstname,
          lastName: user.lastname,
          // Add other fields as needed
        },
        'your_jwt_secret_key',
        { expiresIn: '1h' }
      );

      res.status(200).json({ success: true, message: "Login successful", token });
    });
  } catch (error) {
    console.error("Error verifying Google ID token:", error);
    return res.status(500).json({ error: "Error verifying Google ID token." });
  }
});




router.get('/quizzes/:categoryId/:userId', async (req, res) => {
  const { categoryId, userId } = req.params;

  try {
    // Query to retrieve quizzes, count of questions, and user's progress based on category ID and user ID
    const getQuizzesQuery = `
      SELECT 
        q.quiz_id, 
        q.quiz_name, 
        q.category_id, 
        q.desc, 
        COUNT(qz.question_id) AS question_count,
        IFNULL(ua.answered_count, 0) AS answered_count
      FROM quizzes q
      LEFT JOIN questions qz ON q.quiz_id = qz.quiz_id
      LEFT JOIN (
        SELECT 
          q.quiz_id,
          COUNT(ua.question_id) AS answered_count
        FROM useranswers ua
        INNER JOIN questions q ON ua.question_id = q.question_id
        WHERE ua.user_id_fk = ?
        GROUP BY q.quiz_id
      ) ua ON q.quiz_id = ua.quiz_id
      WHERE q.category_id = ?
      GROUP BY q.quiz_id, ua.answered_count
      HAVING question_count > 0
    `;

    const [quizzes] = await db.promise().query(getQuizzesQuery, [userId, categoryId]);

    res.status(200).json({ success: true, quizzes });
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get('/search-quizzes/:categoryId/:userId', async (req, res) => {
  const { categoryId, userId } = req.params;
  const { searchTerm } = req.query;

  try {
    // Query to retrieve quizzes, count of questions, and user's progress based on category ID, user ID, and search term
    const searchQuizzesQuery = `
      SELECT 
        q.quiz_id, 
        q.quiz_name, 
        q.category_id, 
        q.desc, 
        COUNT(qz.question_id) AS question_count,
        IFNULL(ua.answered_count, 0) AS answered_count
      FROM quizzes q
      LEFT JOIN questions qz ON q.quiz_id = qz.quiz_id
      LEFT JOIN (
        SELECT 
          q.quiz_id,
          COUNT(ua.question_id) AS answered_count
        FROM useranswers ua
        INNER JOIN questions q ON ua.question_id = q.question_id
        WHERE ua.user_id_fk = ?
        GROUP BY q.quiz_id
      ) ua ON q.quiz_id = ua.quiz_id
      WHERE q.category_id = ? 
        AND (q.quiz_name LIKE ? OR q.desc LIKE ?)
      GROUP BY q.quiz_id, ua.answered_count
      HAVING question_count > 0
    `;

    const searchTermWithWildcards = `%${searchTerm}%`;
    const [quizzes] = await db.promise().query(searchQuizzesQuery, [userId, categoryId, searchTermWithWildcards, searchTermWithWildcards]);

    res.status(200).json({ success: true, quizzes });
  } catch (err) {
    console.error("Error searching quizzes:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});







router.get('/count-quizzes', async (req, res) => {
  try {
    // Query to count quizzes per category, excluding quizzes with less than 1 question
    const countQuizzesPerCategoryQuery = `
      SELECT c.quiz_categ_id, 
             COUNT(DISTINCT q.quiz_id) AS quizCount
      FROM quizcategories c
      LEFT JOIN (
        SELECT q.quiz_id, q.category_id
        FROM quizzes q
        INNER JOIN questions qz ON q.quiz_id = qz.quiz_id
        GROUP BY q.quiz_id
      ) q ON c.quiz_categ_id = q.category_id
      GROUP BY c.quiz_categ_id
    `;
    const [countResults] = await db.promise().query(countQuizzesPerCategoryQuery);

    res.status(200).json({ success: true, counts: countResults });
  } catch (err) {
    console.error("Error counting quizzes per category:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Endpoint to delete a quiz by quizId
router.delete('/delete-quiz/:quizId', async (req, res) => {
  const { quizId } = req.params;

  try {
    // Delete quiz from quizzes table
    const deleteQuizQuery = 'DELETE FROM quizzes WHERE quiz_id = ?';
    await db.promise().query(deleteQuizQuery, [quizId]);

    res.status(200).json({ success: true, message: "Quiz deleted successfully" });
  } catch (err) {
    console.error("Error deleting quiz:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get('/count-quizzes', async (req, res) => {
  try {
    // Query to count quizzes per category, excluding quizzes with less than 1 question
    const countQuizzesPerCategoryQuery = `
      SELECT c.quiz_categ_id, COUNT(DISTINCT q.quiz_id) AS quizCount
      FROM quizcategories c
      LEFT JOIN quizzes q ON c.quiz_categ_id = q.category_id
      LEFT JOIN questions qz ON q.quiz_id = qz.quiz_id
      GROUP BY c.quiz_categ_id
      HAVING COUNT(qz.question_id) > 0
    `;
    const [countResults] = await db.promise().query(countQuizzesPerCategoryQuery);

    res.status(200).json({ success: true, counts: countResults });
  } catch (err) {
    console.error("Error counting quizzes per category:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




router.post('/save-quiz', async (req, res) => {
  const { quizTitle, quizCategory } = req.body;

  try {
    // Insert quiz into quizzes table
    const insertQuizQuery = 'INSERT INTO quizzes (category_id, quiz_name, `desc`) VALUES (?, ?, ?)';
    const insertQuizResult = await db.promise().query(insertQuizQuery, [quizCategory, quizTitle, '']);
    const quizId = insertQuizResult[0].insertId;

    res.status(200).json({ success: true, message: "Quiz saved successfully", quizId });
  } catch (err) {
    console.error("Error saving quiz:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post('/save-question', async (req, res) => {
  const { quizId, questionText, questionType, options, correctOptions } = req.body;

  try {
    // Insert question into questions table
    const insertQuestionQuery = 'INSERT INTO questions (quiz_id, question, question_type) VALUES (?, ?, ?)';
    const insertQuestionResult = await db.promise().query(insertQuestionQuery, [quizId, questionText, questionType]);
    const questionId = insertQuestionResult[0].insertId;

    // Handle options and correct answers based on question type
    if (questionType === 1) {
      // Multiple Choice Question
      for (const option of options) {
        // Insert option into options table
        const insertOptionQuery = 'INSERT INTO options (question_id, option_text) VALUES (?, ?)';
        const insertOptionResult = await db.promise().query(insertOptionQuery, [questionId, option]);
        const optionId = insertOptionResult[0].insertId; // Retrieve the inserted option_id

        // Insert into correctanswers table if it's a correct option
        if (correctOptions.includes(options.indexOf(option))) {
          const insertCorrectAnswerQuery = 'INSERT INTO correctanswers (question_id, option_id) VALUES (?, ?)';
          await db.promise().query(insertCorrectAnswerQuery, [questionId, optionId]);
        }
      }
    } else if (questionType === 2) {
      // Single Correct Answer Question
      if (options.length > 0) {
        const correctAnswerText = options[0]; // Assuming options[0] contains the correct answer text

        // Insert correct answer text into options table
        const insertOptionQuery = 'INSERT INTO options (question_id, option_text) VALUES (?, ?)';
        const insertOptionResult = await db.promise().query(insertOptionQuery, [questionId, correctAnswerText]);
        const optionId = insertOptionResult[0].insertId; // Retrieve the inserted option_id

        // Insert into correctanswers table
        const insertCorrectAnswerQuery = 'INSERT INTO correctanswers (question_id, option_id) VALUES (?, ?)';
        await db.promise().query(insertCorrectAnswerQuery, [questionId, optionId]);
      } else {
        console.error('No correct answer provided for single correct answer question');
      }
    }

    res.status(200).json({ success: true, message: 'Question saved successfully', questionId: questionId });
  } catch (err) {
    console.error('Error saving question:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/save-answer', async (req, res) => {
  const { answers } = req.body;

  try {
    // Assuming answers is an array of objects, iterate and insert each answer
    const insertPromises = answers.map(answer => {
      const { user_id, question_id, answer_text, chosen_option_id, is_correct } = answer;
      const insertAnswerQuery = `
          INSERT INTO useranswers (user_id_fk, question_id, answer, chosen_option_id, is_correct)
          VALUES (?, ?, ?, ?, ?)
      `;
      return db.promise().query(insertAnswerQuery, [user_id, question_id, answer_text, chosen_option_id, is_correct]);
    });

    // Execute all insert queries asynchronously
    await Promise.all(insertPromises);

    res.status(201).json({ success: true, message: 'Answers saved successfully' });
  } catch (err) {
    console.error('Error saving answers:', err);
    res.status(500).json({ error: 'Failed to save answers' });
  }
});


router.get('/quiz-results/:quizId/:userId', async (req, res) => {
  const { quizId, userId } = req.params;

  try {
    // Fetch questions, user answers, and correct answers from the database
    const fetchResultsQuery = `
    SELECT
    q.question_id,
    q.question,
    q.question_type,
    o.option_id,
    o.option_text,
    GROUP_CONCAT(ca.option_id) AS correct_option_ids,
    ua.answer,
    ua.chosen_option_id,
    ua.is_correct
FROM
    questions q
LEFT JOIN options o ON q.question_id = o.question_id
LEFT JOIN (
    SELECT question_id, GROUP_CONCAT(option_id) AS option_id FROM correctanswers GROUP BY question_id
) ca ON q.question_id = ca.question_id
LEFT JOIN useranswers ua ON q.question_id = ua.question_id AND ua.user_id_fk = ?
WHERE
    q.quiz_id = ?
GROUP BY
    q.question_id,
    q.question,
    q.question_type,
    o.option_id,
    o.option_text,
    ua.answer,
    ua.chosen_option_id,
    ua.is_correct
    `;
    const [results] = await db.promise().query(fetchResultsQuery, [userId, quizId]);

    // Initialize quiz summary object
    const quizSummary = {};
    let totalQuestions = 0;

    // Process fetched results to populate quizSummary
    results.forEach(result => {
      const {
        question_id,
        question,
        question_type,
        option_id,
        option_text,
        correct_option_ids,
        answer,
        chosen_option_id,
        is_correct
      } = result;

      if (!quizSummary[question_id]) {
        quizSummary[question_id] = {
          question,
          question_type,
          options: [], // Ensure options are initialized as an empty array
          userAnswer: null,
          correctAnswer: [] // Initialize correctAnswer as an empty array
        };
        totalQuestions++;
      }

      // Add options to the options array only if they are unique
      if (option_id && !quizSummary[question_id].options.some(opt => opt.option_id === option_id)) {
        quizSummary[question_id].options.push({ option_id, option_text });
      }

      if (answer !== null) {
        quizSummary[question_id].userAnswer = { answer, chosen_option_id, is_correct };
      }

      if (correct_option_ids) {
        const correctIds = correct_option_ids.split(',').map(id => ({ option_id: id }));
        quizSummary[question_id].correctAnswer = correctIds;
      }
    });

    // Calculate total score
    let totalScore = 0;
    Object.values(quizSummary).forEach(question => {
      if (question.userAnswer && question.userAnswer.is_correct) {
        totalScore++;
      }
    });

    // Return quiz results as JSON response
    res.status(200).json({ success: true, totalScore, totalQuestions, quizSummary });

  } catch (err) {
    console.error('Error fetching quiz results:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});







router.get('/questions/:quizId', async (req, res) => {
  const { quizId } = req.params;

  try {
    // Query to retrieve questions, options, and correct answers based on quiz_id
    const getQuestionsQuery = `
      SELECT q.question_id, q.question, q.question_type,
             o.option_id, o.option_text,
             ca.option_id AS correct_option_id
      FROM questions q
      LEFT JOIN options o ON q.question_id = o.question_id
      LEFT JOIN correctanswers ca ON q.question_id = ca.question_id AND o.option_id = ca.option_id
      WHERE q.quiz_id = ?
    `;

    const [rows] = await db.promise().query(getQuestionsQuery, [quizId]);

    // Organize questions and options into a structured response
    const formattedQuestions = rows.reduce((acc, row) => {
      // Check if the question already exists in the accumulator
      let question = acc.find(q => q.question_id === row.question_id);
      if (!question) {
        // Create a new question object
        question = {
          question_id: row.question_id,
          question: row.question,
          question_type: row.question_type,
          options: [],
          correct_option_ids: []
        };
        acc.push(question);
      }

      // Add option if it exists
      if (row.option_id) {
        question.options.push({ option_id: row.option_id, option_text: row.option_text });
      }

      // Add correct option id if it exists
      if (row.correct_option_id) {
        question.correct_option_ids.push(row.correct_option_id);
      }

      return acc;
    }, []);

    res.status(200).json({ success: true, questions: formattedQuestions });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.delete('/questions/:quizId/:userId', async (req, res) => {
  const { quizId, userId } = req.params;

  try {
    // Delete user answers based on quiz_id and user_id
    const deleteAnswersQuery = `
      DELETE ua
      FROM useranswers ua
      JOIN questions q ON ua.question_id = q.question_id
      WHERE q.quiz_id = ? AND ua.user_id_fk = ?
    `;

    const [result] = await db.promise().query(deleteAnswersQuery, [quizId, userId]);

    // Check if any rows were affected
    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'User answers deleted successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'No user answers found for the given quiz and user.' });
    }
  } catch (err) {
    console.error('Error deleting user answers:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






router.get('/questions/edit/:quizId', async (req, res) => {
  const { quizId } = req.params;

  try {
    // Query to retrieve questions, options, and correct answers based on quiz_id
    const getQuestionsQuery = `
      SELECT q.question_id, q.question, q.question_type,
             o.option_id, o.option_text,
             ca.option_id AS correct_option_id
      FROM questions q
      LEFT JOIN options o ON q.question_id = o.question_id
      LEFT JOIN correctanswers ca ON q.question_id = ca.question_id AND o.option_id = ca.option_id
      WHERE q.quiz_id = ?
    `;

    const [rows] = await db.promise().query(getQuestionsQuery, [quizId]);

    // Organize questions and options into a structured response
    const formattedQuestions = rows.reduce((acc, row) => {
      // Check if the question already exists in the accumulator
      let question = acc.find(q => q.questionText === row.question);
      if (!question) {
        // Create a new question object
        question = {
          questionNumber: acc.length + 1,
          questionType: row.question_type,
          questionText: row.question,
          options: [],
          questionId: row.question_id || null,
          correctOptions: []
        };
        acc.push(question);
      }

      // Add option if it exists
      if (row.option_id) {
        question.options.push(row.option_text);
      }

      // Add correct option index if it exists
      if (row.correct_option_id) {
        const optionIndex = question.options.indexOf(row.option_text);
        if (optionIndex !== -1) {
          question.correctOptions.push(optionIndex);
        }
      }

      return acc;
    }, []);

    res.status(200).json({ success: true, questions: formattedQuestions });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





router.delete('/delete-question/:questionId', async (req, res) => {
  const { questionId } = req.params;

  try {
    // Delete the question; cascading delete will handle associated options and correct answers
    const deleteQuestionQuery = 'DELETE FROM questions WHERE question_id = ?';
    await db.promise().query(deleteQuestionQuery, [questionId]);

    res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





router.put('/update-question/:questionId', async (req, res) => {
  const { questionId } = req.params;
  const { questionText, questionType, options, correctOptions } = req.body;

  try {
    // Update the question text and type
    const updateQuestionQuery = 'UPDATE questions SET question = ?, question_type = ? WHERE question_id = ?';
    await db.promise().query(updateQuestionQuery, [questionText, questionType, questionId]);

    // Delete existing options and correct answers associated with the question
    const deleteCorrectAnswersQuery = 'DELETE FROM correctanswers WHERE question_id = ?';
    await db.promise().query(deleteCorrectAnswersQuery, [questionId]);

    const deleteOptionsQuery = 'DELETE FROM options WHERE question_id = ?';
    await db.promise().query(deleteOptionsQuery, [questionId]);

    // Handle options and correct answers based on question type
    if (questionType === 1) {
      // Multiple Choice Question
      for (const option of options) {
        // Insert option into options table
        const insertOptionQuery = 'INSERT INTO options (question_id, option_text) VALUES (?, ?)';
        const insertOptionResult = await db.promise().query(insertOptionQuery, [questionId, option]);
        const optionId = insertOptionResult[0].insertId; // Retrieve the inserted option_id

        // Insert into correctanswers table if it's a correct option
        if (correctOptions.includes(options.indexOf(option))) {
          const insertCorrectAnswerQuery = 'INSERT INTO correctanswers (question_id, option_id) VALUES (?, ?)';
          await db.promise().query(insertCorrectAnswerQuery, [questionId, optionId]);
        }
      }
    } else if (questionType === 2) {
      // Single Correct Answer Question
      if (options.length > 0) {
        const correctAnswerText = options[0]; // Assuming options[0] contains the correct answer text

        // Insert correct answer text into options table
        const insertOptionQuery = 'INSERT INTO options (question_id, option_text) VALUES (?, ?)';
        const insertOptionResult = await db.promise().query(insertOptionQuery, [questionId, correctAnswerText]);
        const optionId = insertOptionResult[0].insertId; // Retrieve the inserted option_id

        // Insert into correctanswers table
        const insertCorrectAnswerQuery = 'INSERT INTO correctanswers (question_id, option_id) VALUES (?, ?)';
        await db.promise().query(insertCorrectAnswerQuery, [questionId, optionId]);
      } else {
        console.error('No correct answer provided for single correct answer question');
      }
    }

    res.status(200).json({ success: true, message: 'Question updated successfully' });
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});















// GET request to retrieve all customers 
router.get('/userslist', (req, res) => {
  // SQL query to select all customers
  const sql = `SELECT * FROM users`;

  // Execute the queryy
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error retrieving data from the database:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Send the retrieved data as response
    res.status(200).json({ success: true, customers: results });
  });
});








module.exports = router;
