import mongoose from 'mongoose'

const prePolishSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    weightProvided: { type: Number, required: true },
    weightLoss: { type: Number, default: 0 },
    returnedWeight: { type: Number, default: 0 },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

},{
    timestamps:true
})

const PrePolish = mongoose.models.PrePolish || mongoose.model("PrePolish", prePolishSchema);
export default PrePolish