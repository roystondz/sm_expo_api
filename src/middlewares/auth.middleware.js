export const protectRoute = async(req,res,next )=>{
    if( !req.auth().isAuthenticated){
        return res.status(401).json({error:"Unauthorized acess : Please login to continue "});
    }
    next();
}