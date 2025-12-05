import mongoose from "mongoose";
const permissionsSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
   access:[{
    feature:{type:String},
    permission:[Number] // 0->edit,1->create,2->delete,3->view
   }]  
})

const Permissions=mongoose.models.Permissions||mongoose.model("Permissions",permissionsSchema)
export default Permissions;