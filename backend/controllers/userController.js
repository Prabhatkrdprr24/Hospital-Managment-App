import validator from 'validator';
import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import razorpay from 'razorpay';

//API to register a new user
const registerUser = async (req, res) => {
    try{

        console.log(req.body);
        const { name, email, password} = req.body;

        //checking if all fields are filled
        if(!name || !email || !password){
            return res.json({success: false, message: "Please fill all the fields"});
        }

        //validating email
        if(!validator.isEmail(email)){
            return res.json({success: false, message: "Please enter a valid email"});
        }

        //validating password strength
        if(password.length < 8){
            return res.json({success: false, message: "Password must be at least 8 characters long"});
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //creating user object
        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
        res.json({success: true, token});

    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});

    }
}

//API for login user
const loginUser = async (req, res) => {
    
    try{

        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if(!user){
            return res.json({success: false, message: "User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(isMatch){
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
            res.json({success: true, token});
        }
        else{
            return res.json({success: false, message: "Invalid credentials"});
        }

    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});
    }

}

//API to get user profile data
const getProfile = async (req, res) => {

    try{

        const { userId } = req;
        console.log(req.body);
        const userData = await userModel.findById(userId).select('-password');

        res.json({success: true, userData});

    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});
    }

}

//API to update user profile data
const updateProfile = async (req, res) => {

    try{

        const {name, phone, address, dob, gender} = req.body;
        const userId = req.userId;
        const imageFile = req.file;
        console.log(req.body);

        if(!name || !phone || !address || !dob || !gender){
            return res.json({success: false, message: "Data Missing"});
        }

        await userModel.findByIdAndUpdate(userId, {name, phone, address:JSON.parse(address), dob, gender});

        if(imageFile){

            //upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"});
            const imageURL = imageUpload.secure_url;

            await userModel.findByIdAndUpdate(userId, {image: imageURL});
        }

        res.json({success: true, message: "Profile updated successfully"});
            
    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});
    }

}

//API to book an appointment
const bookAppointment = async (req, res) => {
    
    try{

        console.log("Booking appointment...");
        const  userId = req.userId;
        const { docId, slotTime, slotDate } = req.body;

        console.log(req.body);

        const docData = await doctorModel.findById(docId).select('-password');

        if(!docData.available){
            return res.json({success: false, message: "Doctor not available"});
        }

        let slots_booked = docData.slots_booked || [];

        //checking for slot availability
        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({success: false, message: "Slot already booked"});
            }
            else{
                slots_booked[slotDate].push(slotTime);
            }
        }
        else{
            slots_booked[slotDate] = [];
            slots_booked[slotDate].push(slotTime);
        }

        const userData = await userModel.findById(userId).select('-password');
        delete docData.slots_booked;

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotDate,
            slotTime,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        //save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, {slots_booked});

        res.json({success: true, message: "Appointment booked"});

    }
    catch(error){
        console.error(error);
        // console.error("Error in bookAppointment:", error);
        res.json({success: false, message: error.message});

    }

}

//API to get all appointments of a user
const listAppointment = async (req, res) => {

    try{

        const userId = req.userId;
        const appointments = await appointmentModel.find({userId});

        res.json({success: true, appointments});

    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});
    }

}

//API to cancel an appointment
const cancelAppointment = async (req, res) => {

    try{

        const userId = req.userId;
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);

        //verify appointment user
        if(appointmentData.userId !== userId){
            return res.json({success: false, message: "You are not authorized to cancel this appointment"});
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled: true});

        //releasing doctor slot
        const {docId, slotDate, slotTime} = appointmentData;

        const doctorData = await doctorModel.findById(docId);
        let slots_booked = doctorData.slots_booked;
        
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);

        await doctorModel.findByIdAndUpdate(docId, {slots_booked});

        res.json({success: true, message: "Appointment cancelled"});

    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});
    }

}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

//API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {

    try{

        // console.log("Processing payment... backend");
        const { appointmentId } = req.body;
        // console.log("Appointment ID:", appointmentId);
        const appointmentData = await appointmentModel.findById(appointmentId);
        console.log("Appointment Data:", appointmentData);

        if(!appointmentData || appointmentData.cancelled){
            return res.json({success: false, message: "Appointment not found or cancelled"});
        }

        //creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100, //amount in paise
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        };

        //creating order in razorpay
        const order = await razorpayInstance.orders.create(options);
        // console.log("Razorpay Order:", order);

        res.json({success: true, order});

    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});
    }
    
}

//API to verify razorpay payment
const verifyRazorpay = async (req, res) => {

    try{

        const { razorpay_order_id } = req.body;
        console.log("Verifying Razorpay payment for order ID:", req.body);
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        if(orderInfo.status === 'paid'){

            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {payment: true});
            res.json({success: true, message: "Payment successful"});

        }
        else{
            res.json({success: false, message: "Payment failed"});
        }

    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});
    }

}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay };