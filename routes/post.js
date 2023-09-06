const express=require("express");
const { createPost, likeAndUnlikePost, deletePost, getPostofFollowing, updateCaption,  commentOnPost, deleteComment } = require("../controllers/post");
const { isAuthenticated } = require("../middleware/auth");

const router=express.Router();

//we can call multiple handler inside here 
//we are first authenticating user and then user can create a post
router.route("/post/upload").post(isAuthenticated,createPost);


router.route("/post/:id").get(isAuthenticated,likeAndUnlikePost);
router.route("/post/:id").delete(isAuthenticated,deletePost);


router.route("/post/:id").put(isAuthenticated,updateCaption);

router.route("/post/comment/:id").put(isAuthenticated,commentOnPost);

router.route("/post/comment/:id").delete(isAuthenticated,deleteComment);

//router.route("/posts").get(isAuthenticated,getPostofFollowing);



module.exports=router;