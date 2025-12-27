exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();
    table.uuid("tenant_id").nullable();
    table.string("email").notNullable();
    table.string("password_hash").notNullable();
    table.string("full_name").notNullable();
    table
      .enu("role", ["super_admin", "tenant_admin", "user"])
      .notNullable();
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true);

    table
      .foreign("tenant_id")
      .references("id")
      .inTable("tenants")
      .onDelete("CASCADE");

    table.unique(["tenant_id", "email"]);
    table.index(["tenant_id"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("users");
};
