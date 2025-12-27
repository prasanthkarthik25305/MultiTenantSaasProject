exports.up = async function (knex) {
  await knex.schema.createTable("tenants", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("subdomain").notNullable().unique();
    table
      .enu("status", ["active", "suspended", "trial"])
      .defaultTo("trial");
    table
      .enu("subscription_plan", ["free", "pro", "enterprise"])
      .defaultTo("free");
    table.integer("max_users").notNullable();
    table.integer("max_projects").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("tenants");
};
