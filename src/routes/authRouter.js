import express from "express";
import { createCredentials, getProfile, login, logout, requestOtp, resendForgotOtp, resendOtp, resetPassword, sendResetOtp, updateProfile, verifyForgotOtp, verifyOtp } from "../controller/authController.js";
import protect from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";


const userRouter = express.Router();


userRouter.post("/request-otp", requestOtp);

userRouter.post("/verify-otp/:userId", verifyOtp);

userRouter.post("/resend-verify-otp/:userId", resendOtp);

userRouter.post("/create-credentials", protect, upload.single("profilePic"), createCredentials);

userRouter.post('/login', login);

userRouter.post('/logout', protect, logout);

userRouter.get("/profile", protect, getProfile);


userRouter.put("/complete-profile/:userId", protect, upload.single("profilePic"), updateProfile);


userRouter.post("/forgot-password/reset-otp", sendResetOtp);

userRouter.post("/forgot-password/verify-forgot-otp", verifyForgotOtp);


userRouter.post("/resend-forgotverify-otp/:userId", resendForgotOtp);


userRouter.post("/forgot-password/reset-password/:userId", resetPassword);


export default userRouter;
