import express from "express";
import { createCredentials, getProfile, login, logout, requestOtp, resetPassword, sendResetOtp, updateProfile, verifyForgotOtp, verifyOtp } from "../controller/authController.js";
import protect from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";


const userRouter = express.Router();


userRouter.post("/request-otp", requestOtp);


userRouter.post("/verify-otp/:userId", verifyOtp);

userRouter.post("/create-credentials", protect, upload.fields([{ name: "profilePic", maxCount: 1 }]), createCredentials);


userRouter.post('/login', login);

userRouter.post('/logout', protect, logout);

userRouter.get("/profile", protect, getProfile);


userRouter.put("/complete-profile/:userId", protect, upload.single("profilePic"), updateProfile);


userRouter.put("/forgot-password/reset-otp", sendResetOtp);

userRouter.post("/forgot-password/verify-forgot-otp", verifyForgotOtp);

userRouter.post("/forgot-password/reset-password", resetPassword);


export default userRouter;
