const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { AppError } = require('../middlewares/errorMiddleware');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const userExists = await UserModel.findByEmail(validatedData.email);
    if (userExists) {
      throw new AppError('Email sudah terdaftar', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    const userId = await UserModel.createUser(validatedData.email, hashedPassword, validatedData.role);

    res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil!',
      data: { userId, email: validatedData.email, role: validatedData.role }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await UserModel.findByEmail(validatedData.email);
    if (!user || !(await bcrypt.compare(validatedData.password, user.password))) {
      throw new AppError('Email atau password salah', 401);
    }

    const tokens = generateTokens(user);

    // Kirim Refresh Token di HTTP-Only Cookie untuk keamanan ekstra
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Hari
    });

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil!',
      accessToken: tokens.accessToken
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};