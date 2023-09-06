const Post =require("../models/Post")
const User=require("../models/User");
exports.createPost=async(req,res)=>{
    try{
        const newPostData={
            caption: req.body.caption,
            image:{
                public_id:"req.body.public_id",
                url:"req.body.url"
            },
            owner: req.user._id
        }

        const newPost= await Post.create(newPostData);
        const user=await User.findById(req.user._id);
        user.posts.push(newPost._id);

        await user.save();

        res.status(201).json({
            success:true,
            post:newPost
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

exports.deletePost=async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);
        if(!post)
        {
            return res.status(404).json({
                success:false,
                message:"post not found"
            })
        }

        if(post.owner.toString()!== req.user._id.toString())
        {
            return res.status(401).json({
                success:false,
                message: "Unauthorized"
            })
        }

        await post.deleteOne();


        const user=await User.findById(req.user._id);
        const index=user.posts.indexOf(req.params.id);
        user.posts.slice(index,1);
        await user.save();

        res.status(200).json({
            success:true,
            message: "Post Deleted"
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

exports.likeAndUnlikePost=async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);
        if(!post)
        {
            return res.status(401).json({
                success:false,
                message:"post not found"
            })
        }
        if(post.like.includes(req.user._id))
        {
            const index=post.like.indexOf(req.user._id);

            post.like.slice(index,1);
            await post.save();
            return res.status(200).json({
                success:true,
                message:"post unliked"
            })
        }
        else{
            post.like.push(req.user._id);
            await post.save();
            return res.status(200).json({
                success:true,
                message:"post Liked"
            })
        }

       
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


exports.updateCaption=async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);

        if(!post)
        {
            return res.status(404).json({
                success:false,
                message: "Post not found"
            })
        }

        if(post.owner.toString()!==req.user._id.toString())
        {
            return res.status(401).json({
                success:false,
                message: "Unauthorized"
            })
        }
        post.caption=req.body.caption;
        await post.save();

        return res.status(200).json({
            success:true,
            message:"caption updated successfully"
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


exports.commentOnPost=async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);
        if(!post)
        {
            return res.status(404).json({
                success:false,
                message:"Post not found"
            })
        }
        let commentIndex=-1;
       // let commentIndex=-1;
        //check if user is already commented or not
        post.Comments.forEach((item,index)=>{
            if(item.user.toString()==req.user._id.toString())
            {
                commentIndex=index;

            }
        })
        console.log(commentIndex);
      if(commentIndex!=-1)
      {
        post.Comments[commentIndex].comment=req.body.comment;
        await post.save();
        return res.status(200).json({
            success:true,
            message:"comment added"
        })
      }
      else{
        post.Comments.push({
            user:req.user._id,
            comment:req.body.comment
        });

        await post.save();
        return res.status(200).json({
            success:true,
            message:"comment added"
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

exports.deleteComment=async(req,res)=>{
    try{
        const post =await Post.findById(req.params.id);
        if(!post)
        {
            return res.status(404).json({
                success:false,
                message:"Post not found"
            })
        } 
        //if owner is trying to delete , they can delete anybody's comment.
        if(post.owner.toString()==req.user._id.toString())
        {
            if(req.body.commentId==undefined)
            {
                return res.status(400).json({
                    success:false,
                    message:"Comment ID is required"

                })

            }
            post.Comments.forEach((item,index)=>{
                if(item._id.toString()==req.body.commentId.toString())
                {
                   return post.Comments.splice(index,1)
    
                }
            }) 
            await post.save();
            return res.status(200).json({
                success:true,
                message:"selected comment is deleted"

            })
        }
        else{
           //if another user is trying to delete the comment he has posted on somebody profile 
           //then he should be capable to deleting his own comment only  
            post.Comments.forEach((item,index)=>{
                if(item.user.toString()==req.user._id.toString())
                {
                   return post.Comments.splice(index,1)
    
                }
            })

            await post.save();

            return res.status(200).json({
                success:true,
                message:"comment is deleted"

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