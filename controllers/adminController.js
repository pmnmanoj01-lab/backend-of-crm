import bcrypt from "bcryptjs";
import User from "../models/User.js";
import mongoose from "mongoose";
import Permissions from "../models/Permissions.js";
const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, category, role, password } = req.body;

    // Validate required fields
    if (!name || !email || !password || !category || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing user
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const newUser = new User({
      name,
      email,
      phone,
      category,            // matches schema category
      role,   // frontend "subCategory" saved as backend "role"
      password: hashedPassword,
      access: []           // optional: default empty access array
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        category: newUser.category,
        role: newUser.role
      }
    });

  } catch (error) {
    console.log(error);
    next(error);
  }
};
// const getAllUsers = async (req, res) => {
//   try {
//     const page = Math.max(parseInt(req.query.page || "1"), 1);
//     const limit = Math.max(parseInt(req.query.limit || "10"), 1);
//     const search = (req.query.search || "").trim();
//     const role = req.query.role || "";
//     const sortBy = req.query.sortBy || "createdAt";
//     const order = req.query.order === "asc" ? 1 : -1;
//     const currentUserId = req.user?.id;
//     const filter = {};
//     if (currentUserId) {
//       filter._id = { $ne: currentUserId };
//     }

//     if (search) {
//       // case-insensitive partial match on name or email
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//       ];
//     }
//     if (role && role !== "all") {
//       filter.role = role;
//     }

//     const total = await User.countDocuments(filter);
//     const users = await User.find(filter)
//       .select("-password")
//       .sort({ [sortBy]: order })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .lean();

//     return res.status(200).json({
//       users,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit) || 1,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.max(parseInt(req.query.limit || "10"), 1);
    const search = (req.query.search || "").trim();
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.user?.role;          
    const currentUserCategory = req.user?.user?.category;  
    let filter = {
      _id: { $ne: currentUserId } // EXCLUDE self
    };

    // ================================
    // 🔥 Access Rules
    // ================================

    // 1️⃣ ADMIN → sees ALL except self
    if (currentUserCategory === "admin" || currentUserRole === "admin") {
      // no extra filter
    }
    else if (currentUserRole === "Manager" && currentUserCategory === "Manager") {
      filter.$or = [
        { role: currentUserRole }
      ];
    }

    // 2️⃣ CATEGORY MANAGER LOGIC
    else if (currentUserRole === "Manager"&& currentUserCategory !== "Manager") {
      filter.$or = [
        { category: currentUserCategory }
      ];
    }

    // 3️⃣ OTHER EMPLOYEES → cannot view others
    else {
      return res.status(403).json({
        message: "You are not allowed to view user list"
      });
    }

    // ================================
    // 🔍 Search Filter
    // ================================
    if (search) {
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ]
        }
      ];
    }

    // ================================
    // 📌 Query DB
    // ================================
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, category, role, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid user id" });

    const update = { name, email, phone, category, role };
    // remove undefined keys
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }

    // check if email exists for other user
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: id } });
      if (existing) return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "User updated", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid user id" });

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await Permissions.findOneAndDelete({ userId: id });

    return res.status(200).json({ message: "User deleted", id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// controllers/admin.controller.js

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};



const updatePermissions = async (req, res) => {
  try {
    const { userId, access } = req.body;

    if (!userId || !access)
      return res.status(400).json({
        success: false,
        message: "Missing userId or access array",
      });

    const existing = await Permissions.findOne({ userId });

    if (existing) {
      existing.access = access;
      await existing.save();
    } else {
      await Permissions.create({ userId, access });
    }

    res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const getUserPermissions = async (req, res) => {
  try {
    const userId = req.params.id;

    const permissions = await Permissions.findOne({ userId });

    res.status(200).json({
      success: true,
      permissions: permissions || { access: [] },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load permissions",
      error: err.message,
    });
  }
};


export { registerUser, getAllUsers, updateUser, deleteUser, getUserById, updatePermissions, getUserPermissions };
