import validator from 'validator';
import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';

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

export { registerUser, loginUser };