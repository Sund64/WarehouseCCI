const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
  role: z.enum(['Super Admin', 'Manager', 'Staff'], { message: "Role tidak valid" })
});

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(1, { message: "Password wajib diisi" })
});

module.exports = { registerSchema, loginSchema };