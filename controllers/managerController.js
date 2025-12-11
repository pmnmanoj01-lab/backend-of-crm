import User from "../models/User.js";

const getProductionAllUsersAtoRole = async (req, res) => {
  try {
    // Current logged-in user (to exclude from list)
    const currentUserId = req.user?.id;

    // Accept roles as array
    let roles = req.query.roles || [];

    // Convert "roles=Manager,Worker" into array
    if (typeof roles === "string") {
      roles = roles.split(",").map((r) => r.trim());
    }

    // Build filter
    let filter = {
      _id: { $ne: currentUserId }, // Exclude current user
    };

    // If roles provided, apply role filter
    if (roles.length > 0) {
      filter.role = { $in: roles };
    }

    // Get users
    const users = await User.find(filter).select("-password").lean();

    return res.status(200).json({
      users,
      total: users.length,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export { getProductionAllUsersAtoRole };
