"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../../config"));
const handleAppError_1 = __importDefault(require("../../errors/handleAppError"));
const user_model_1 = require("../user/user.model");
const sendEmail_1 = require("../../utils/sendEmail");
// Helper to generate tokens
const generateTokens = (payload) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, config_1.default.jwt_access_secret, {
        expiresIn: "24h",
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.default.jwt_refresh_secret, {
        expiresIn: "3d",
    });
    return { accessToken, refreshToken };
};
// Register a user in database
const registerUserOnDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.UserModel.create(payload);
    return result;
});
// Login with credentials
const loginUserFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExists = yield user_model_1.UserModel.findOne({ email: payload === null || payload === void 0 ? void 0 : payload.email });
    if (!isUserExists) {
        throw Error("User does not exists!");
    }
    // check password
    const isPasswordMatched = yield bcrypt_1.default.compare(payload === null || payload === void 0 ? void 0 : payload.password, isUserExists === null || isUserExists === void 0 ? void 0 : isUserExists.password);
    if (!isPasswordMatched) {
        throw new handleAppError_1.default(http_status_1.default.UNAUTHORIZED, "Wrong Credentials!");
    }
    const user = yield user_model_1.UserModel.findByIdAndUpdate(isUserExists === null || isUserExists === void 0 ? void 0 : isUserExists._id, { status: "active" }, { new: true }).select("-password");
    const jwtPayload = {
        _id: user === null || user === void 0 ? void 0 : user._id,
        id: user === null || user === void 0 ? void 0 : user._id,
        name: user === null || user === void 0 ? void 0 : user.name,
        email: user === null || user === void 0 ? void 0 : user.email,
        role: user === null || user === void 0 ? void 0 : user.role,
        gender: user === null || user === void 0 ? void 0 : user.gender,
        walletPoint: user === null || user === void 0 ? void 0 : user.walletPoint,
    };
    const { accessToken, refreshToken } = generateTokens(jwtPayload);
    return { user, accessToken, refreshToken };
});
// Login with provider
const loginUserUsingProviderFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield user_model_1.UserModel.findOne({ email: payload === null || payload === void 0 ? void 0 : payload.email });
    if (!user) {
        user = yield user_model_1.UserModel.create(payload);
    }
    else {
        user = yield user_model_1.UserModel.findByIdAndUpdate(user._id, { status: "active" }, { new: true });
    }
    const jwtPayload = {
        _id: user === null || user === void 0 ? void 0 : user._id,
        id: user === null || user === void 0 ? void 0 : user._id,
        name: user === null || user === void 0 ? void 0 : user.name,
        email: user === null || user === void 0 ? void 0 : user.email,
        role: user === null || user === void 0 ? void 0 : user.role,
        gender: user === null || user === void 0 ? void 0 : user.gender,
        walletPoint: user === null || user === void 0 ? void 0 : user.walletPoint,
    };
    const { accessToken, refreshToken } = generateTokens(jwtPayload);
    return { user, accessToken, refreshToken };
});
// Refresh token
const refreshAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.default.jwt_refresh_secret);
        const user = yield user_model_1.UserModel.findOne({ email: decoded.email }).select("-password");
        if (!user) {
            throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
        }
        const jwtPayload = {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            gender: user.gender,
            walletPoint: user.walletPoint,
        };
        const accessToken = jsonwebtoken_1.default.sign(jwtPayload, config_1.default.jwt_access_secret, { expiresIn: "24h" });
        return { accessToken };
    }
    catch (error) {
        throw new handleAppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid or expired refresh token");
    }
});
// Logout
const logoutUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.UserModel.findByIdAndUpdate(id, { status: "inActive" }, { new: true });
    return {};
});
// Change password
const changePasswordInDB = (userId, oldPassword, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    const isPasswordMatched = yield bcrypt_1.default.compare(oldPassword, user.password);
    if (!isPasswordMatched) {
        throw new handleAppError_1.default(http_status_1.default.UNAUTHORIZED, "Old password is incorrect!");
    }
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield user_model_1.UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
    return {};
});
// Forgot password
const forgotPasswordInDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findOne({ email });
    if (!user) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    const hashedToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    yield user_model_1.UserModel.findByIdAndUpdate(user._id, {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    const resetUrl = `${config_1.default.frontend_url}/auth/reset-password?token=${resetToken}`;
    const html = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
    yield (0, sendEmail_1.sendEmail)(email, "Password Reset Request", html);
    return {};
});
// Reset password
const resetPasswordInDB = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    const user = yield user_model_1.UserModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
        throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or expired reset token!");
    }
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield user_model_1.UserModel.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
    });
    return {};
});
const getMeFromDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findOne({ email }).select("-password");
    if (!user) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    return user;
});
exports.AuthServices = {
    registerUserOnDB,
    loginUserFromDB,
    loginUserUsingProviderFromDB,
    refreshAccessToken,
    logoutUserFromDB,
    changePasswordInDB,
    forgotPasswordInDB,
    resetPasswordInDB,
    getMeFromDB,
};
