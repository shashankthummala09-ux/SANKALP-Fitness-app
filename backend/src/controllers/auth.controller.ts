import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

// Helper to generate JWT
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

// Password validator (PRD requirement: min 8 characters, at least 1 number)
const validatePassword = (password: string): boolean => {
  if (password.length < 8) return false;
  return /\d/.test(password);
};

// Email validator
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, city, language } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long and contain at least one number.' 
      });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    // We default city to 'Unknown' or custom city if provided
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        city: city || 'Unknown',
        language: language || 'en',
        // Optional fields dob, gender are stored dynamically or can be added/extended as needed.
        // Prisma schema can handle these if they are added or we can use custom profile models.
        // For onboarding, the PRD lists Goals setup separately, so they are created in goals table later.
      },
    });

    // 5. Generate token
    const token = generateToken(user.id);

    // 6. Return response
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        language: user.language,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // 3. Generate token
    const token = generateToken(user.id);

    // 4. Return user info + token
    return res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        language: user.language,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side handles token clearance)
 * @access  Public
 */
export const logout = async (_req: Request, res: Response) => {
  // Since we use stateless JWT, logout is handled by the client discarding the token.
  // We can return a success message here.
  return res.status(200).json({ message: 'Logged out successfully. Please clear your token.' });
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user details
 * @access  Private
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        language: true,
        createdAt: true,
        goals: true, // Include onboarding goals if present
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Internal server error fetching user profile.' });
  }
};

/**
 * @route   PUT /api/auth/language
 * @desc    Update current user's language preference
 * @access  Private
 */
export const updateLanguage = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { language } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!language) {
      return res.status(400).json({ error: 'Language is required.' });
    }

    const supportedLanguages = ['en', 'hi', 'te', 'de', 'es', 'fr'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({ error: 'Unsupported language.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { language },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        language: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: 'Language updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update language error:', error);
    return res.status(500).json({ error: 'Internal server error updating language preference.' });
  }
};
