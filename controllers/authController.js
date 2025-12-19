import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Permissions from "../models/Permissions.js";
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // 1️⃣ Check if email exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        //validate that user is blocked or unblocked
        if (!user.isActive && user !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked. Please contact the administrator."
            });
        }


        // 2️⃣ Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 3️⃣ Generate JWT token
        const token = jwt.sign(
            {
                id: user._id, user, isImpersonating: false,
                impersonatedBy: {}
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 4️⃣ Set token in cookies
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });


        // 5️⃣ Response
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
};
const DecodeToken = async (req, res) => {
    try {
        // Get only access array
        let permissionDoc = await Permissions.findOne(
            { userId: req.user.id },
            { access: 1, _id: 0 }       // only return access array
        ).lean();

        // Clean access array: remove _id from each item
        let cleanedAccess = [];
        if (permissionDoc?.access) {
            cleanedAccess = permissionDoc.access.map(item => ({
                feature: item.feature,
                permission: item.permission
            }));
        }

        // Full user object returned by auth middleware

        const user = await User.findById(req.user.id).select("-password -createdAt -updatedAt").lean();
        const newUser = {
            ...user,
            isImpersonating: req.user.isImpersonating ? req.user.isImpersonating : false,
            impersonatedBy: req.user.impersonatedBy ? req.user.impersonatedBy : {},
            access: cleanedAccess  // attach cleaned access array
        };

        res.status(200).json({
            success: true,
            message: "Authenticated user",
            user: newUser,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


const Logout = (req, res) => {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out" });

};
const impersonateAdmin = async (req, res) => {
    if (req.user.user.role !== "admin") {
        return res.status(403).json({ message: "Only admin can impersonate" });
    }

    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign(
        {
            id: targetUser._id,
            user: targetUser,
            isImpersonating: true,
            impersonatedBy: {
                _id: req.user.id,
                role: req.user.user.role
            }
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ success: true });
}
const exitImpersonateAdmin = async (req, res) => {
    if (!req.user.isImpersonating) {
        return res.status(400).json({ message: "Not impersonating" });
    }
    const user = await User.findById(req.user?.impersonatedBy?._id).lean()
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const token = jwt.sign(
        {
            id: user._id, user, isImpersonating: false,
            impersonatedBy: {}
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true });
}
export { login, DecodeToken, Logout, impersonateAdmin, exitImpersonateAdmin };
