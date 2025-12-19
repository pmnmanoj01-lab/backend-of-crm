import User from "../models/User.js";
import Product from "../models/Product.js"; // assume exists

const getDashboardStatData = async (req, res) => {
    try {
        const currentUserId = req.user?.id;

        // -----------------------------
        // USER COUNTS
        // -----------------------------
        const totalUsersPromise = User.countDocuments({
            _id: { $ne: currentUserId },
        });

        const totalManagersPromise = User.countDocuments({
            role: "Manager",
            _id: { $ne: currentUserId },
        });

        const totalEmployeesPromise = User.countDocuments({
            role: { $nin: ["admin", "Manager"] },
            _id: { $ne: currentUserId },
        });

        // -----------------------------
        // PRODUCT COUNT
        // -----------------------------
        const totalProductsPromise = Product.countDocuments();

        // -----------------------------
        // PARALLEL EXECUTION
        // -----------------------------
        const [
            totalUsers,
            totalManagers,
            totalEmployees,
            totalProducts,
        ] = await Promise.all([
            totalUsersPromise,
            totalManagersPromise,
            totalEmployeesPromise,
            totalProductsPromise,
        ]);

        return res.status(200).json({
            stats: {
                totalUsers,
                totalManagers,
                totalEmployees,
                totalProducts,
            },
        });

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

export { getDashboardStatData };
