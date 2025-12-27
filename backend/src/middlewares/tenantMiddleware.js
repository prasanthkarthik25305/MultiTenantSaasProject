module.exports = (req, res, next) => {
  // Super admin can access all tenants
  if (req.user.role === "super_admin") {
    return next();
  }

  const tenantIdFromRequest =
    req.params.tenantId ||
    req.body.tenant_id ||
    req.query.tenant_id;

  if (
    tenantIdFromRequest &&
    tenantIdFromRequest !== req.user.tenantId
  ) {
    return res.status(403).json({ message: "Cross-tenant access denied" });
  }

  next();
};
