exports.seed = async function(knex) {
    await knex('users').del();
    await knex('users').insert([
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob',   email: 'bob@example.com' }
    ]);
  };