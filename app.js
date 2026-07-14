const express = require('express');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const { errorHandler, AppError } = require('./middlewares/errorMiddleware');

const app = express();

// Middleware untuk membaca request body berbentuk JSON
app.use(express.json());

// ==========================================
// API ROUTES
// ==========================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/inventory', inventoryRoutes);

// ==========================================
// HANDLING UNHANDLED ROUTES (404)
// ==========================================
// Jika client mengakses rute yang tidak terdaftar
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// ==========================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ==========================================
// Wajib diletakkan di paling bawah rantai Express agar bisa menangkap semua error dari controller
app.use(errorHandler);

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running as Senior Backend on port ${PORT}`);
});