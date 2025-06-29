import validator from 'validator';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';

// API for adding doctor
const addDoctor = async (req, res) => {

    try{
        const { name, email, password, image, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        //checking for all data to add doctor
        if (!name || !email || !password || !imageFile || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ message: "All fields are required" });
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ message: "Invalid email format" });
        }

        // validating strong password
        if(password.length < 8){
            return res.json({ message: "Password must be at least 8 characters long" });
        }

        // hashing doctor's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
        const imageUrl = imageUpload.secure_url;

        // creating doctor object
        const doctorData = {
            name,
            email,
            password: hashedPassword,
            image: imageUrl,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address), // assuming address is a JSON string
            date: Date.now(),
        }

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({sucess: true, message: "Doctor added successfully"});

    }
    catch(error) {
        console.error("Error adding doctor:", error);
        res.json({ message: error.message });
    }
}

// API for admin login
const loginAdmin = async (req, res) => {
    try{

        const { email, password } = req.body;
        console.log(email, password);

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        }
        else{
            return res.json({ success:false, message: "Invalid credentials" });
        }

    }
    catch(error) {
        console.error("Error logging in admin:", error);
        res.json({ message: error.message });
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try{

        const doctors = await doctorModel.find({}).select('-password');
        res.json({ success: true, doctors });

    }
    catch(error) {
        console.log(error);
        res.json({ message: error.message });
    }
}
    

export { addDoctor, loginAdmin, allDoctors };