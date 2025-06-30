import doctorModel from "../models/doctorModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import appointmentModel from "../models/appointmentModel.js";


const changeAvailability = async (req, res) => {
    try{

        const {docId} = req.body;

        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });
        res.json({success: true, message: 'Doctor availability changed'});

    }
    catch{
        console.error(err);
        res.json({success: false, message: error.message});
    }
}

const doctorList = async (req, res) => {
    try{

        const doctors = await doctorModel.find({}).select(['-password', '-email']);
        res.json({success: true, doctors});

    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});
    }
}

//API to login doctor
const loginDoctor = async (req, res) => {

    try{

        const {email, password} = req.body;

        const doctor = await doctorModel.findOne({email});
        if(!doctor){
            return res.json({success: false, message: 'Doctor not found'});
        }
        
        const isMatch = await bcrypt.compare(password, doctor.password);
        if(isMatch){

            const token = jwt.sign({id: doctor._id}, process.env.JWT_SECRET);
            res.json({success: true, token});

        }
        else{
            return res.json({success: false, message: 'Invalid credentials'});
        }


    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});
    }

}

//API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {

    try{

        // console.log("Fetching appointments for doctor... backend");
        const docId = req.docId;
        // console.log("Doctor ID:", docId);

        const appointments = await appointmentModel.find({ docId});

        res.json({success: true, appointments});

    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});
    }

}
    
//API to mark appointment as completed for doctor panel
const appointmentComplete = async (req, res) => {

    try{

        const {appointmentId} = req.body;
        const docId = req.docId;

        const appointmentData = await appointmentModel.findById(appointmentId);

        if(appointmentData && appointmentData.docId === docId){
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
            res.json({success: true, message: 'Appointment marked as completed'});
        }
        else{
            return res.json({success: false, message: 'Mark appointment failed'});
        }

    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});
    }

}

//API to mark appointment as cancelled for doctor panel
const appointmentCancel = async (req, res) => {

    try{

        const {appointmentId} = req.body;
        const docId = req.docId;

        const appointmentData = await appointmentModel.findById(appointmentId);

        if(appointmentData && appointmentData.docId === docId){
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
            res.json({success: true, message: 'Appointment marked as completed'});
        }
        else{
            return res.json({success: false, message: 'Cancellation failed'});
        }

    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});
    }

}

//API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {

    try{

        const docId = req.docId;

        const appointments = await appointmentModel.find({ docId });
        let earnings = 0;
        appointments.map((item) => {
            if(item.isCompleted || item.payment){
                earnings += item.amount;
            }
        })

        let patients = [];
        appointments.map((item) => {
            if(!patients.includes(item.userId)){
                patients.push(item.userId);
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({success: true, dashData});

    }
    catch(error){
        console.error(error);
        res.json({success: false, message: error.message});
    }

}

export {changeAvailability, doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, appointmentCancel, doctorDashboard};