const db = require("../config/db");

async function getAll({ search = "", status = "", limit = 50, offset = 0 }) {
  let sql = "SELECT * FROM tasks WHERE 1=1";
  const params = [];

  if (search) {
    sql += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
  params.push(Number(limit), Number(offset));
  const [rows] = await db.execute(sql, params);
  return rows;
}

async function getById(id) {
  const [rows] = await db.execute("SELECT * FROM tasks WHERE id = ?", [id]);
  return rows[0] || null;
}

async function create({ title, description = "", status = "pending" }) {
  const [result] = await db.execute(
    "INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)",
    [title, description, status]
  );
  return getById(result.insertId);
}

async function update(id, { title, description, status }) {
  const fields = [];
  const values = [];

  if (title !== undefined) { fields.push("title = ?"); values.push(title); }
  if (description !== undefined) { fields.push("description = ?"); values.push(description); }
  if (status !== undefined) { fields.push("status = ?"); values.push(status); }

  if (fields.length === 0) return getById(id);

  values.push(id);
  await db.execute(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`, values);
  return getById(id);
}

async function remove(id) {
  const [result] = await db.execute("DELETE FROM tasks WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = { getAll, getById, create, update, remove };
