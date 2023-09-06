const Post = require("../models/Post");
const User=require("../models/User");
const {sendEmail} =require("../middleware/sendEmail");
const crypto=require("crypto");
//const { default: ErrorHandler } = require("../middleware/error");

exports.register=async(req,res)=>{
    try{
        const {name, email, password}=req.body;

        let user= await User.findOne({email});
        if(user)
        {
            return res.status(400).json({success:false,message:"User already exits"});
        }
       
            user= await User.create({name,email,password,avatar:{public_id:"sample_id",url:"sample_url"}});
            //res.status(201).json({success:true,user});
            const token=await user.generateToken();
            //setting cookie for 90 days for login
            const options={
                expires:new Date(Date.now()+90*24*60*60*1000),
                httpOnly:true,
                sameSite:process.env.NODE_ENV==="Development"?"lax":"none",
                secure:process.env.NODE_ENV==="Development"?false:true
            }
            res.status(201).cookie("token",token,options).json({
                success:true,
                user,
                token
            })
        
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message: error.message
        })
    }
}


exports.login= async(req,res,next)=>{
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email}).select("+password");
        if(!user)
        {
            return res.status(400).json({
                success:false,
                message: "User does not exist"
            })
        }

        const isMatch=await user.matchPassword(password);
        if(!isMatch)
        {
            return res.status(400).json({
                success:false,
                message: "incorrect password"
            })
        }

        const token=await user.generateToken();
        //setting cookie for 90 days for login
        const options={
            expires:new Date(Date.now()+90*24*60*60*1000),
            httpOnly:true,
            sameSite:process.env.NODE_ENV==="Development"?"lax":"none",
            secure:process.env.NODE_ENV==="Development"?false:true
        }
        res.status(200).cookie("token",token,options).json({
            success:true,
            user,
            token
        })
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.followUser=async(req,res)=>{
    try{
        const usertoFollow=await User.findById(req.params.id);
        const loggedInUser=await User.findById(req.user._id);

        if(!usertoFollow){
            return res.status(404).json({
                success:false,
                message: "User does not exist"
            })
        }

        if(loggedInUser.following.includes(usertoFollow._id))
        {
            const indexfollowing=loggedInUser.following.indexOf(usertoFollow._id);
            loggedInUser.following.slice(indexfollowing,1);

            const indexfollowers=usertoFollow.followers.indexOf(loggedInUser._id);
            usertoFollow.following.slice(indexfollowers,1);

            await loggedInUser.save();
            await usertoFollow.save();
            return res.status(200).json({
                success:true,
                message: "User Unfollowed"
            })
        }
        else{
            loggedInUser.following.push(usertoFollow._id);
            usertoFollow.followers.push(loggedInUser._id);
    
            await loggedInUser.save();
            await usertoFollow.save();
            return res.status(200).json({
                success:true,
                message: "User followed"
            })
        }

       
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message: error.message
        })
    }
}


exports.logout=async(req,res)=>{
    try{
        const options={
            expires:new Date(Date.now()+90*24*60*60*1000),
            httpOnly:true,
            sameSite:process.env.NODE_ENV==="Development"?"lax":"none",
            secure:process.env.NODE_ENV==="Development"?false:true
        }
        res.status(200).cookie("token",null,options).json({
            success:true,
            message:"logged Out"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message: error.message
        })
    }
}

exports.updatePassword=async(req,res)=>{
    try{
        const user=await User.findById(req.user._id);
        const {oldpassword,newpassword}=req.body;

        if(!oldpassword || !newpassword)
        {
            return res.status(400).json({
                success:false,
                message:"Please enter oldpassword and new password"
            })
        }

        const isMatch=await user.matchPassword(oldpassword);
        if(!isMatch)
        {
            return res.status(400).json({
                success:false,
                message:"Incorrect old password"
            })
        }
        user.password=newpassword;
        await user.save();
        return res.status(200).json({
            success:true,
            message: "password updated successfully"
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message: error.message
        })
    }
}


exports.updateProfile=async(req,res)=>{
    try{
        const user=await User.findById(req.user._id).select("+password");
        const {name,email}=req.body;
        if(name){
            user.name=name;
        }
        if(email){
            user.email=email;
        }

        await user.save();
        return res.status(200).json({
            success:true,
            message:"Profile updated successfully"
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message: error.message
        })
    }
}


exports.deleteUser=async(req,res)=>{
    try{
        const user=await User.findById(req.user._id);
        const posts=user.posts;
        const followers=user.followers;
        const following=user.following;

        const userID=user._id;
        await user.deleteOne();

        //logout user after deleting the profile
        res.cookie("token",null,{
            expires: new Date(Date.now()),
            httpOnly:true
        });

        //deleting all post of user
        if(posts)
        {
            for(let i=0;i<posts.length;i++)
            {
                const post=await Post.findById(posts[i]);
                await post.deleteOne();
            }
        }

        // remove user from followers following
        if(followers)
        {
            for(let i=0;i<followers.length;i++)
            {
                const follower=await User.findById(followers[i]);

                const index=follower.following.indexOf(userID);
                follower.following.slice(index,1);

                await follower.save();
            }

            
        }
        if(following)
        {
            for(let i=0;i<following.length;i++)
            {
                const followings=await User.findById(following[i]);

                const index=followings.followers.indexOf(userID);
                followings.followers.slice(index,1);

                await followings.save();
            }
        }
        
        return res.status(200).json({
            success:true,
            message: "user deleted"
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message: error.message
        })
    }
}


exports.myProfile=async(req,res)=>{
    try{
        const user=await User.findById(req.user._id).populate("posts");
        return res.status(200).json({
            success:true,
            user
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message: error.message
        })
    }
}

exports.getUserProfile=async(req,res)=>{
    try{
        const user=await User.findById(req.params.id).populate("posts");
        if(!user)
        {
            return res.status(404).json({
                success:true,
                message:"User not found"
            })
        }
        return res.status(200).json({
            success:true,
            user
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message: error.message
        }) 
    }
}

exports.getAllUsers=async(req,res)=>{
    try{
        const users=await User.findById({});
        return res.status(200).json({
            success:true,
            users
        })
    }catch(error)
    {
        return res.status(500).json({
            success:false,
            message: error.message
        })
    }
}


exports.forgotPassword=async(req,res)=>{
    try{
       const user=await User.findOne({email:req.body.email});
       if(!user)
       {
            return res.status(400).json({
                success:false,
                message:"Email not found"
            })
       }

       const resetpasswordToken=user.getResetPasswordToken();

       await user.save();

       const resetUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetpasswordToken}`;
       const message=`Reset your password by clicking on the link below : \n\n ${resetUrl}`;

       try{
        await sendEmail({email:user.email,subject:"Reset Password",message});
        res.status(200).json({
            success:true,
            message:`Email send to ${user.email}`
        })
       }
       catch(error)
       {
         user.resetPasswordToken=undefined;
         user.resetPasswordExpire=undefined;

         await user.save();
         return res.status(500).json({
            success:false,
            message: error.message
        })
       }


    }catch(error)
    {
        return res.status(500).json({
            success:false,
            message: error.message
        })
    }
}

exports.resetPassword=async(req,res)=>{
    try{
        const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user=await User.findOne({
            resetPasswordToken,
            resetPasswordExpire:{$gt:Date.now()}
        })

        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"token is invalid or has expired"
            })
        }
        if(req.body.password==undefined)
        {
            return res.status(400).json({
                success:false,
                message:"please enter a password"
            })
        }
        user.password=req.body.password;
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save();
        return res.status(200).json({
            success:true,
            message: "Password updated successfully"
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message: error.message
        })
    }
}



