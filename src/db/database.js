import * as Crypto from "expo-crypto";

export const DATABASE_NAME = "register_basic.db";

async function hashPassword(password, salt) {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + password,
  );
}

async function generateSalt() {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function initDb(db) {
  await db.execAsync(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            student_id TEXT NOT NULL UNIQUE,
            username TEXT NOT NULL UNIQUE,
            password_salt TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
     `);
}

export function listStudent(db) {
  return db.getAllAsync(
    `SELECT id,
            name,
            surname,
            student_id,
            username,
            substr(password_hash,1,16) AS hash_review
     FROM students
     ORDER BY id DESC`,
  );
}

export async function findDuplicate(db, studentId, username) {
  const row = await db.getFirstAsync(
    "SELECT student_id, username FROM students WHERE student_id = ? OR username = ?",
    [studentId, username],
  );

  if (!row) return null;
  if (row.student_id === studentId) return "studentId";
  return "username";
}

export async function registerStudent(
  db,
  { name, surname, studentId, username, password },
) {
  const duplicate = await findDuplicate(db, studentId, username);

  if (duplicate === "studentId") {
    return {
      ok: false,
      field: "studentId",
      message: "รหัสนิสิตนี้ลงทะเบียนแล้ว",
    };
  }

  if (duplicate === "username") {
    return { ok: false, field: "username", message: "ชื่อผู้ใช้นี้ถูกใช้แล้ว" };
  }

  const salt = await generateSalt();
  const hash = await hashPassword(password, salt);

  try {
    const result = await db.runAsync(
      `INSERT INTO students (name, surname, student_id, username, password_salt, password_hash, created_at)
       VALUES (?,?,?,?,?,?,?)`,
      [
        name,
        surname,
        studentId,
        username,
        salt,
        hash,
        new Date().toISOString(),
      ],
    );
    return { ok: true, id: result.lastInsertRowId };
  } catch (e) {
    console.warn("registerStudent ล้มเหลว", e);
    return {
      ok: false,
      field: "username",
      message: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง",
    };
  }
}

export async function clearStudents(db) {
  const result = await db.runAsync("DELETE FROM students");
  await db.runAsync("DELETE FROM sqlite_sequence WHERE name = 'students'");
  return { ok: true, deleted: result.changes };
}

export async function loginStudent(db, username, password) {
    const row = await db.getFirstAsync(
      `SELECT id, name, surname, student_id, user_name, password_salt, password_hash FROM
      students WHERE username = ?`, [username]
    )
    const fail = { ok: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'}
    if (!row) return fail

    const hash = await hashPassword(password, row.password_salt)
    if ( hash !== row.password_hash ) return fail

    return{
      ok: true,
      user: {
        id: row.id,
        name: row.name,
        surname: row.surname,
        student_id: row.student_id,
        username: row.username
      }
    }
}

export function getStudentById(db, id) {
  return db.getFirstAsync(
    `SELECT id, name, surname, student_id, username, create_at FROM students WHERE id=?`
    ,[id]
  )
  
}