// routes/auth.js  –  ES‑module version
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const client = new OAuth2Client();

const SALT_ROUNDS = 10;

/* -------- JWT helper -------- */
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

/* ========== REGISTER ========== */
router.post('/register', async function register(req, res) {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }


    //regex added for proper mail
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(email)){
      return res.status(400).json({message: "Please enter a valid email account"});
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    const token = generateToken(newUser._id);
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        email: newUser.email
      },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/* ========== LOGIN ========== */
router.post('/login', async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(email)){
      return res.status(400).json({message: "Invalid email format"});
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    /* users created through Google OAuth have no local hash */
    if (!user.password) {
      return res.status(400).json({ message: 'Please log in with Google' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/* ========== GOOGLE OAUTH ========== */
router.post('/google', async function googleLogin(req, res) {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      /* create account with no local password */
      user = await User.create({
        firstName: name.split(' ')[0],
        lastName: name.split(' ')[1] || '',
        email,
        password: ''                  // no hash stored
      });
    }

    const jwtToken = generateToken(user._id);
    return res.status(200).json({
      message: 'Google login successful',
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(401).json({ message: 'Google authentication failed' });
  }
});

/* ========== CURRENT USER ========== */
router.get('/me', protect, async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    return res.status(200).json({
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email
    });
  } catch (err) {
    console.error('Fetch user error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
