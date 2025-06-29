import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';


//app config
const app = express();

//middleware
app.use(express.json());
app.use(cors());

connectDB();
connectCloudinary();

//api endpoints
app.use('/api/admin', adminRouter);
// localhost:4000/api/admin/add-doctor
app.use('/api/doctor', doctorRouter);
// localhost:4000/api/doctor/list
app.use('/api/user', userRouter);
// localhost:4000/api/user/register


app.get('/', (req, res) => {
  res.send('Welcome to the Prescripto API!!!!!');
});


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});