import mongoose from 'mongoose'

const filingSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    material: { type: String },
    subCategory: { type: String },
    extraMaterialWeight: { type: Number, default: 0 },
    childCategory: { type: String },
    weightProvided: { type: Number, required: true },
    needExtraMaterial: { type: Boolean, default: false },
    weightLoss: { type: Number, default: 0 },
    returnedWeight: { type: Number, default: 0 },
    scrab: { type: Number, default: 0 },
    wireWeight: { type: Number, default: 0 },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: true
})

const Filing = mongoose.models.Filing || mongoose.model("Filing", filingSchema);
export default Filing