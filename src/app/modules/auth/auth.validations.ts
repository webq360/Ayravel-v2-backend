import z from "zod";

const registerUser = z.object({
  name: z
    .string()
    .min(1, "Name is required to create a user!")
    .max(40, "Name must be less than 40 characters!"),
  email: z
    .string()
    .email("Invalid email format!")
    .min(1, "Email is required to create a user!")
    .max(50, "Email must be less than 50 characters!"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long!")
    .max(20, "Password must be less than 20 characters!"),
});

const loginUser = z.object({
  email: z
    .string()
    .email("Invalid email format!")
    .min(1, "Email is required to create a user!")
    .max(50, "Email must be less than 50 characters!"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long!")
    .max(20, "Password must be less than 20 characters!"),
});

const loginUserUsingProvider = z.object({
  name: z
    .string()
    .min(1, "Name is required to create a user!")
    .max(40, "Name must be less than 40 characters!"),
  email: z
    .string()
    .email("Invalid email format!")
    .min(1, "Email is required to create a user!")
    .max(50, "Email must be less than 50 characters!"),
  provider: z.enum(['facebook', 'google'], {
    message: "Provider must be 'facebook' or 'google'!",
  }),
});

const changePassword = z.object({
  userId: z.string().min(1, "User ID is required!"),
  oldPassword: z.string().min(1, "Old password is required!"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters long!")
    .max(20, "New password must be less than 20 characters!"),
});

const forgotPassword = z.object({
  email: z.string().email("Invalid email format!"),
});

const resetPassword = z.object({
  token: z.string().min(1, "Token is required!"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long!")
    .max(20, "Password must be less than 20 characters!"),
});

export const AuthValidations = {
  registerUser,
  loginUser,
  loginUserUsingProvider,
  changePassword,
  forgotPassword,
  resetPassword,
};
