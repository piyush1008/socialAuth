const mongoose=require("mongoose");

exports.connectDatabase=()=>{
    console.log("sdfsadf")
    mongoose.connect(process.env.MONGO_URI)
    .then(con=> console.log(`Database connected ${con.connection.host}`))
    .catch(err=> console.log(err));
}