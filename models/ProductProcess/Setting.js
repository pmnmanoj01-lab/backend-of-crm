import mongoose from "mongoose";

const DiamondDimensionSchema = new mongoose.Schema(
  {
    dimension: {
      type: String,
      trim: true,
    },
    pieces: {
      type: Number,
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const ProductSettingSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    weightProvided: {
      type: Number,
      required: true,
      min: 0,
    },

    returnedWeight: {
      type: Number,
      default: 0,
      min: 0,
    },

    weightLoss: {
      type: Number,
      default: 0,
      min: 0,
    },

    diamondCategory: {
      type: String,
      required: true,
    },

    diamondSubCategory: {
      type: String,
      required: true,
    },

    diamondChildCategory: {
      type: [String],
      default: [],
    },

    // 🔥 MAIN PART
    diamondDetails: {
      type: Map,
      of: [DiamondDimensionSchema],
      default: {},
    },

    // 🔒 Track saved shapes
    savedShapes: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Setting", ProductSettingSchema);
