const express=require("express");
const app=new express;
const cookieParser=require("cookie-parser");


if(process.env.NODE_ENV!='production')
{
    require("dotenv").config({path:"backend/config/config.env"})
}

//using middlewar
//this middleware is used to make req.body works
app.use(express.json());

//this middleware is used to get form datat
app.use(express.urlencoded({extended:true}));

//this middleware is used to make the cookie work req.cookie
app.use(cookieParser());


//importing routes

const post=require("./routes/post");
const user=require("./routes/user");

//using routes
app.use("/api/v1",post);
app.use("/api/v1",user);

module.exports=app;