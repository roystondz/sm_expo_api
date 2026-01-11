import express from 'express';
import { followUser, getCurrentUser, getuserProfile, syncUser, updateProfile } from '../controllers/user.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get("/profile/:username",getuserProfile);

router.post("/sync",protectRoute,syncUser);
router.post("/me",protectRoute,getCurrentUser);

router.put("/profile",protectRoute,updateProfile);

router.post("/follow/:targetUserId",protectRoute,followUser);


export default router;