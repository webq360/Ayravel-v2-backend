import httpStatus from "http-status";
import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";

const registerUser = catchAsync(async (req, res) => {
  const userInfo = req.body;
  const result = await AuthServices.registerUserOnDB(userInfo);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User has been registered successfully!",
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const userInfo = req?.body;
  const result = await AuthServices.loginUserFromDB(userInfo);

  const userData = result?.user?.toJSON ? result.user.toJSON() : result?.user;

  sendResponse(
    res
      .cookie("accessToken", result?.accessToken, {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", result?.refreshToken, {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "none",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      }),
    {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Logged in Successfully!",
      data: { ...userData, accessToken: result?.accessToken },
    }
  );
});

const loginUserUsingProvider = catchAsync(async (req, res) => {
  const userInfo = req?.body;
  const result = await AuthServices.loginUserUsingProviderFromDB(userInfo);

  const userData = result?.user?.toJSON ? result.user.toJSON() : result?.user;

  sendResponse(
    res
      .cookie("accessToken", result?.accessToken, {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })
      .cookie("refreshToken", result?.refreshToken, {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "none",
        maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      }),
    {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Logged in Successfully!",
      data: { ...userData, accessToken: result?.accessToken },
    }
  );
});

const refreshToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "No refresh token provided",
      data: null,
    });
  }

  const result = await AuthServices.refreshAccessToken(refreshToken);

  sendResponse(
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: config.node_env === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    }),
    {
      success: true,
      statusCode: httpStatus.OK,
      message: "Access token refreshed successfully",
      data: null,
    }
  );
});

const logOutUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const result = await AuthServices.logoutUserFromDB(userId);

  sendResponse(
    res
      .cookie("accessToken", "", {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "none",
        maxAge: 0,
      })
      .cookie("refreshToken", "", {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "none",
        maxAge: 0,
      }),
    {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Logged Out Successfully!",
      data: result,
    }
  );
});

const changePassword = catchAsync(async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  await AuthServices.changePasswordInDB(userId, oldPassword, newPassword);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password changed successfully!",
    data: null,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  await AuthServices.forgotPasswordInDB(email);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password reset link sent to your email!",
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;

  await AuthServices.resetPasswordInDB(token, newPassword);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password reset successfully!",
    data: null,
  });
});

const getMe = catchAsync(async (req, res) => {
  const user = await AuthServices.getMeFromDB(req.user.email);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User data retrieved successfully!",
    data: user,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  loginUserUsingProvider,
  refreshToken,
  logOutUser,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
};
