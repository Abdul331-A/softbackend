import express from "express";
import { createCredentials, getProfile, requestOtp, updateProfile, verifyOtp } from "../controller/authController.js";
import protect from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";


const userRouter = express.Router();

userRouter.post("/request-otp", requestOtp);

userRouter.post("/verify-otp/:userId", verifyOtp);
userRouter.post("/create-credentials", protect, upload.single("profilePic"), createCredentials);
userRouter.get("/profile", protect, getProfile);


userRouter.put("/complete-profile", protect, updateProfile);


export default userRouter;
