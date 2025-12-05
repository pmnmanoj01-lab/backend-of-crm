import mongoose from "mongoose";
const productSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true
    },
   
},{
    timestamps:true
})

const Product=mongoose.models.Product||mongoose.model("Product",productSchema)
export default Product;