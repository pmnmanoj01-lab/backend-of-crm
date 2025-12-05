import mongoose from "mongoose";
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    phone:{
        type:String,
        trim:true
    },
    category:{
        type:String,
        enum:["admin","Developement","Designer","Marketing","Manager","Casting","Production","HR"]
    },

    password:{
        type:String,
        required:true,
        trim:true
    },
    role:{
        type:String,
        required:true,
        enum:["admin","Frontend Developer" ,"Backend Developer", "Full Stack Developer", "DevOps Engineer","App Development","MERN Stack Developer","PHP Developer","MEAN Stack Developer","Cade Designer","Graphic Designer",,"Website Designer","Sales Marketing","Social Media Marketing","Digital Marketing","Development Manger","Designer Manager","Marketing Manager","Manager","Casting Manager","Production Manager","Dia Casting","Metal Casting","Filing","Setting","Pre Polish","Polish","Repair","HR Executive", "Recruiter", "HR Manager"],
        trim:true
    },
  
},{
    timestamps:true
})

const User=mongoose.models.User||mongoose.model("User",userSchema)
export default User;