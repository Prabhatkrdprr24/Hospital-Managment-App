import validator from 'validator';
import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';

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

export { registerUser, loginUser, getProfile, updateProfile };