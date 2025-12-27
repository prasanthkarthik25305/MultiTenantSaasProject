exports.up = async function (knex) {
  await knex.schema.createTable("projects", (table) => {
    table.uuid("id").primary();

    // Tenant isolation
    table.uuid("tenant_id").notNullable();

    table.string("name").notNullable();
    table.text("description");

    table
      .enu("status", ["active", "archived", "completed"])
      .defaultTo("active");

    table.uuid("created_by").notNullable();

    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign("tenant_id")
      .references("id")
      .inTable("tenants")
      .onDelete("CASCADE");

    table
      .foreign("created_by")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Indexes (MANDATORY)
    table.index(["tenant_id"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("projects");
};
