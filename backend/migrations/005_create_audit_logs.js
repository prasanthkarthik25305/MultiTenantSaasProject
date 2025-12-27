exports.up = async function (knex) {
  await knex.schema.createTable("audit_logs", (table) => {
    table.uuid("id").primary();

    // Tenant isolation
    table.uuid("tenant_id").notNullable();

    table.uuid("user_id").nullable();

    table.string("action").notNullable();        // e.g. CREATE_PROJECT
    table.string("entity_type").notNullable();  // e.g. project, task
    table.uuid("entity_id").nullable();

    table.string("ip_address").nullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Foreign keys
    table
      .foreign("tenant_id")
      .references("id")
      .inTable("tenants")
      .onDelete("CASCADE");

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    // Indexes (MANDATORY)
    table.index(["tenant_id"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("audit_logs");
};
