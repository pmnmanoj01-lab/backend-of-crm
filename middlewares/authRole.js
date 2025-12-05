import Permissions from "../models/Permissions.js";

const actionMap = {
  POST: 1,     // create
  GET: 3,      // view
  PUT: 0,      // edit
  PATCH: 4,    // edit
  DELETE: 2,   // delete
};

export const checkAccess = (features) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.user.role;
      const userId = req.user.user._id;

      // Admin can access everything
      if (userRole === "admin") return next();

      const actionCode = actionMap[req.method];
      if (actionCode === undefined) {
        return res.status(400).json({ message: "Unsupported HTTP method" });
      }

      // Ensure features is always an array
      const featureList = Array.isArray(features) ? features : [features];

      // Fetch permissions
      const userPermissions = await Permissions.findOne({ userId });
      if (!userPermissions) {
        return res.status(403).json({ message: "No permissions found" });
      }

      // Check if ANY feature matches and contains action code
      const hasAccess = featureList.some((feature) => {
        const featureAccess = userPermissions.access.find(
          (item) => item.feature === feature
        );
        // console.log("has access-----------> ",feature)
        return featureAccess && featureAccess.permission.includes(actionCode);
      });
// console.log("has access-----------> ",hasAccess)
      if (!hasAccess) {
        return res.status(403).json({ message: "Access Denied" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  };
};
