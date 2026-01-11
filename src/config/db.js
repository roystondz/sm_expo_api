import { ENV } from "./env.js";
import mongoose from 'mongoose'; 

export const connectDB =async()=>{
    try {
        await mongoose.connect(ENV.MONGO_URI) ;
        console.log("Connected to DB succesfully : 📦");
    } catch (error) {
        
        console.log("Error in DB connection :",error);
        process.exit(1);
    }
}