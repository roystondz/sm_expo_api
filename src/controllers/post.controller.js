import asyncHandler from "express-async-handler";

import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getAuth } from "@clerk/express";
import cloudinary from "../config/cloudinary.js";
import Comment from "../models/comment.model.js";


export const getPosts = asyncHandler(async(req,res)=>{
    const posts = await Post.find()
    .sort({createdAt:-1})
    .populate("user","username firstName lastName profilePicture"
    )
    .populate({
        path:"comments",
        populate:{
            path:"user",
            select:"username firstName lastName profilePicture"
        }
    })


    res.status(200).json({posts});
})

export const getPost = asyncHandler(async(req,res)=>{
    const {postId} = req.params;

    const post = await Post.findById(postId)
    .populate("user","username firstName lastName profilePicture"
    )
    .populate({
        path:"comments",
        populate:{
            path:"user",
            select:"username firstName lastName profilePicture"
        }
    })

    if(!post) return res.status(404).json({error:"Post not found"});

    res.status(200).json({post});
})

export const getUserPosts = asyncHandler(async(req,res)=>{
    const {username} = req.params;
    
    const user = await User.findOne({username});
    if(!user) return res.status(404).json({error:"user not found"});

    const posts = await Post.find({user:user._id})
    .sort({createdAt:-1})
    .populate("user","username firstName lastName profilePicture"
    )
    .populate({
        path:"comments",
        populate:{
            path:"user",
            select:"username firstName lastName profilePicture"
        }
    })

    if (posts.length===0) return res.status(404).json({error:"No posts found for this user"});

    res.status(200).json({posts});
})

export const createPost = asyncHandler(async(req,res)=>{
    const {userId} = getAuth(req);
    const {content} = req.body;
    
    const imageFile = req.file;

    if(!content &&  !imageFile) return res.status(400).json({error:"Post content or image is required"});

    const user = await User.findOne({clerkId:userId});
    if (!user) return res.status(404).json({error:"User not found"});

    let imageUrl = "";
    if(imageFile){
        try {
            
            const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;

            const uploadResponse = await cloudinary.uploader.upload(base64Image,{
                folder:"social_media_posts",
                resource_type:"image",
                transformation:[
                    {width:800,height:600,crop:"limit"},
                    {quality:"auto"},
                    {format:"auto"}
                ]
            })

            imageUrl = uploadResponse.secure_url;

        } catch (error) {
            console.error("Error uploading to cloudinary",error);
            return res.status(500).json({error:"Could not upload image"});
        }
    }

    const post = await Post.create({
        user:user._id,
        image:imageUrl,
        content:content||""
    })

    res.status(201).json({post:post,message : "Post created successfully"});
})

export const likePost = asyncHandler(async(req,res)=>{
    const {postId} = req.params;

    if(!postId) return res.status(400).json({error:"Post Id is required"});

    const {userId} = getAuth(req);

    const user = await User.findOne({clerkId:user});
    const post = await Post.findById(postId);

    if(!user) return res.status(404).json({error:"User not found"});
    if(!post) return res.status(404).json({error:"Post not found"});

    const isLiked =post.likes.includes(user._id);

    if(isLiked){
        await Post.findByIdAndUpdate(postId,{
            $pull:{likes:user._id}
        })
    }else{
        await Post.findByIdAndUpdate(postId,{
            $push:{
                likes:user._id
            }
        })

        await Notification.create({
            from:user._id,
            to:post.user,
            type:"like",
            post:postId
        })

    }



    return res.status(200).json({message:isLiked?"Post Liked":"Post Unliked"})


   

    
})

export const deletePost = asyncHandler(async(req,res)=>{
    const {postId} = req.params;
    const {userId} = getAuth(req);


    if(!postId) return res.status(400).json({message:"Post Id is required"});
    if(!userId) return res.status(402).json({error:"Please login in"})


    const user = await User.findOne({clerkId:userId});
    const post = await Post.findById(postId);

    if(user._id.toString() !== post.user.toString()){
        res.status(403).json({error:"You can only delete your posts"})
    }

    await Comment.deleteMany({post:postId});

    await Post.findByIdAndDelete(postId);

    res.status(200).json({message:"Post deleted successfully"});


})
