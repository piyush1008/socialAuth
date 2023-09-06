const express=require("express");
const { register, login, followUser, logout, updatePassword, updateProfile, deleteUser,myProfile, getUserProfile, getAllUsers, forgotPassword, resetPassword } = require("../controllers/user");
const { isAuthenticated } = require("../middleware/auth");



const router=express.Router();

router.route("/register").post(register);

router.route("/login").post(login)

router.route("/follow/:id").get(isAuthenticated,followUser)

router.route("/logout").get(isAuthenticated,logout);

router.route("/update/password").put(isAuthenticated,updatePassword);

router.route("/delete/me").delete(isAuthenticated,deleteUser);

router.route("/me").get(isAuthenticated,myProfile);


router.route("/user/:id").get(isAuthenticated,getUserProfile);

router.route("/users").get(isAuthenticated,getAllUsers);

router.route("/update/profile").put(isAuthenticated,updateProfile);

router.route("/forgot/password").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

module.exports=router;