export function valiadateForm({
  name,
  surname,
  studentID,
  username,
  password,
  confirm,
}) {
  const error = {};

  if (name.trim() === "") error.name = "กรุณากรอกชื่อ";

  if (surname.trim() === "") error.surname = "กรุณากรอกนามสกุล";

  if (studentID.trim() === "") {
    error.studentID = "กรุณากรอกรหัสนิสิต";
  } else if (!/^\d{10}$/.test(studentID.trim())) {
    error.studentID = "รหัสนิสิตต้องเป็นตัวเลข 10 หลัก";
  }

  if (username.trim() === "") {
    error.username = "กรุณากรอกชื่อผู้ใช้";
  } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(username.trim())) {
    error.username =
      "ชื่อผู้ใช้ยาว 4-20 ตัวอักษร ใช้ได้เฉพาะ a-z A-Z 0-9 และ _";
  }

  if (password.length < 8) {
    error.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  } else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    error.password = "รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข";
  }

  if (confirm !== password) {
    error.confirm = "รหัสผ่านไม่ตรงกัน";
  }

  return error;
}

export function hasErrors(error) {
  return Object.keys(error).length > 0;
}
