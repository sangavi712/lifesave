import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  console.log('[AuthController] registerUser hit. Name:', name, 'Email:', email);

  const trimmedName = name ? name.trim() : '';
  const trimmedEmail = email ? email.toLowerCase().trim() : '';

  if (!trimmedName || !trimmedEmail || !password) {
    console.warn('[AuthController] registerUser: Missing fields');
    res.status(400);
    return next(new Error('Please fill in all fields'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    console.warn('[AuthController] registerUser: Invalid email format:', trimmedEmail);
    res.status(400);
    return next(new Error('Please enter a valid email address'));
  }

  const sanitizedEmail = trimmedEmail;

  if (password.length < 6) {
    console.warn('[AuthController] registerUser: Password too short');
    res.status(400);
    return next(new Error('Password must be at least 6 characters long'));
  }

  try {
    // Check if user already exists
    console.log('[AuthController] registerUser: Checking if email exists...');
    const userExistQuery = await pool.query('SELECT * FROM users WHERE email = $1', [sanitizedEmail]);
    console.log('[AuthController] registerUser: Duplicate check completed. Count:', userExistQuery.rows.length);
    if (userExistQuery.rows.length > 0) {
      console.warn('[AuthController] registerUser: User already exists');
      res.status(400);
      return next(new Error('User already exists with this email'));
    }

    // Hash the password
    console.log('[AuthController] registerUser: Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('[AuthController] registerUser: Password hashed successfully.');

    // Insert user
    // The first registered user can be admin, or default to 'user'. Let's check how many users exist.
    // If no users, make admin. Otherwise 'user'.
    console.log('[AuthController] registerUser: Getting total user count...');
    const countUsers = await pool.query('SELECT COUNT(*) FROM users');
    const role = parseInt(countUsers.rows[0].count, 10) === 0 ? 'admin' : 'user';
    console.log('[AuthController] registerUser: Assigning role:', role);

    console.log('[AuthController] registerUser: Inserting user into database...');
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, sanitizedEmail, hashedPassword, role]
    );

    const user = newUser.rows[0];
    console.log('[AuthController] registerUser: User inserted. ID:', user.id);

    console.log('[AuthController] registerUser: Generating token...');
    const token = generateToken(user.id);
    console.log('[AuthController] registerUser: Token generated. Sending JSON response.');

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('[AuthController] registerUser: Catch block error:', error);
    next(error);
  }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  console.log('[AuthController] loginUser hit. Email:', email);

  if (!email || !password) {
    console.warn('[AuthController] loginUser: Missing credentials');
    res.status(400);
    return next(new Error('Please provide email and password'));
  }

  const sanitizedEmail = email.toLowerCase().trim();
  console.log('[AuthController] loginUser: sanitized email to:', sanitizedEmail);

  try {
    // Check user email
    console.log('[AuthController] loginUser: Querying user email from database...');
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [sanitizedEmail]);
    console.log('[AuthController] loginUser: Query completed. Match found:', userQuery.rows.length > 0);
    if (userQuery.rows.length === 0) {
      console.warn('[AuthController] loginUser: User not found in database');
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    const user = userQuery.rows[0];

    // Check password match
    console.log('[AuthController] loginUser: Comparing password hashes...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('[AuthController] loginUser: Password matches:', isMatch);
    if (!isMatch) {
      console.warn('[AuthController] loginUser: Password mismatch');
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    console.log('[AuthController] loginUser: Generating token...');
    const token = generateToken(user.id);
    console.log('[AuthController] loginUser: Token generated. Sending JSON response.');

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('[AuthController] loginUser: Catch block error:', error);
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};
