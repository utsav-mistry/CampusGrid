/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to routes based on user roles
 */

/**
 * Check if user has required role
 * @param {Array|String} allowedRoles - Single role or array of allowed roles
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated (should be set by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Convert single role to array
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Check if user's role is in allowed roles
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
        });
      }

      // User has required role, proceed
      next();
    } catch (error) {
      console.error('RBAC Error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

/**
 * Predefined role checkers for convenience
 */
export const requireAdmin = requireRole('admin');
export const requireRecruiter = requireRole('recruiter');
export const requireStudent = requireRole('student');

/**
 * Allow multiple roles
 */
export const requireAnyRole = (...roles) => requireRole(roles);

/**
 * Check if user is admin or the resource owner
 * @param {Function} getResourceOwnerId - Function to extract owner ID from request
 */
export const requireAdminOrOwner = (getResourceOwnerId) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin can access anything
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user is the owner
      const ownerId = getResourceOwnerId(req);
      if (req.user.id === ownerId || req.user._id.toString() === ownerId) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    } catch (error) {
      console.error('RBAC Error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

/**
 * Audit log for admin actions
 */
export const auditAdminAction = (action) => {
  return (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      console.log(`[ADMIN AUDIT] ${action} by ${req.user.email} at ${new Date().toISOString()}`);
    }
    next();
  };
};
