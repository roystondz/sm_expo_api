import express from 'express';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import cors from "cors";
import {clerkMiddleware} from "@clerk/express"
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/post.route.js';
import commentRoute from './routes/comment.route.js'
import notificationRoute from "./routes/notification.route.js"
import { arcjetMiddleware } from './middlewares/arcjet.middleware.js';

const app = express();


app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.use(arcjetMiddleware); //no need of calling


app.get("/",(req,res)=>{
    res.send("Hello from the backend server");
})

//user routes
app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/comments",commentRoute);
app.use("/api/notifications",notificationRoute);



const startServer = async()=>{
    try {
        //Connects to the Database
connectDB();
if(ENV.NODE_ENV !=="production"){
    app.listen(ENV.PORT,()=>{
        console.log("Server is running on port :",ENV.PORT);
    })
}
    } catch (error) {
        console.log("Failed top start server : ",error);
        process.exit(1)
    }
}
startServer();


export default app;