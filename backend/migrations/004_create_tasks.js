exports.up = async function (knex) {
  await knex.schema.createTable("tasks", (table) => {
    table.uuid("id").primary();

    // Tenant isolation
    table.uuid("tenant_id").notNullable();

    table.uuid("project_id").notNullable();

    table.string("title").notNullable();
    table.text("description");

    table
      .enu("status", ["todo", "in_progress", "completed"])
      .defaultTo("todo");

    table
      .enu("priority", ["low", "medium", "high"])
      .defaultTo("medium");

    table.uuid("assigned_to").nullable();
    table.date("due_date").nullable();

    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign("tenant_id")
      .references("id")
      .inTable("tenants")
      .onDelete("CASCADE");

    table
      .foreign("project_id")
      .references("id")
      .inTable("projects")
      .onDelete("CASCADE");

    table
      .foreign("assigned_to")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    // Indexes (MANDATORY)
    table.index(["tenant_id"]);
    table.index(["tenant_id", "project_id"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("tasks");
};
