import express from 'express';
import { bookAppointment, cancelAppointment, getProfile, listAppointment, loginUser, registerUser, paymentRazorpay, verifyRazorpay } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';
import { updateProfile } from '../controllers/userController.js';
import { verifyEmailOtp } from '../controllers/userController.js';
import { resendEmailOtp } from '../controllers/userController.js';
import { resetPassword } from '../controllers/userController.js';
import { setNewPassword } from '../controllers/userController.js';
import { verifyResetPassword } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile);
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/appointments', authUser, listAppointment);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);
userRouter.post('/payment-razorpay', authUser, paymentRazorpay); 
userRouter.post('/verifyRazorpay', authUser, verifyRazorpay);
userRouter.post('/verify-otp', authUser, verifyEmailOtp);
userRouter.get('/resend-otp', authUser, resendEmailOtp);
userRouter.post('/password-reset', resetPassword);
userRouter.post('/verify-reset-otp', verifyResetPassword);
userRouter.post('/set-new-password', setNewPassword)

export default userRouter;