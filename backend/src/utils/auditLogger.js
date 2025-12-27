const knex = require("../config/db");
const crypto = require("crypto");

module.exports = async ({ tenantId, userId, action, entityType, entityId, ip }) => {
  await knex("audit_logs").insert({
    id: crypto.randomUUID(),
    tenant_id: tenantId,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    ip_address: ip
  });
};
