import mongoose from 'mongoose'

const polishSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    weightProvided: { type: Number, required: true },
    weightLoss: { type: Number, default: 0 },
    returnedWeight: { type: Number, default: 0 },
    material: { type: String },
    subCategory: { type: String },
    extraMaterialWeight: { type: Number, default: 0 },
    childCategory: { type: String },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

})

const Polish = mongoose.models.Polish || mongoose.model("Polish", polishSchema);
export default Polish