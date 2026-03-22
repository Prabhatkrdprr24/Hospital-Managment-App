import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected', () => {
        console.log('MongoDB connected')
    });

    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`);
    }
    catch(err){
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
    
        
}

export default connectDB;