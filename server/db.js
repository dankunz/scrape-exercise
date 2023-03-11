import pg from "pg";

const pool = new pg.Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});
pool.on("connect", (client) => {
  client
    .query(
      "CREATE TABLE IF NOT EXISTS advertisements (ID SERIAL PRIMARY KEY, title VARCHAR(255), image_url VARCHAR(255), price INT)"
    )
    .catch((err) => console.log("PG ERROR", err));
});

export default pool;
