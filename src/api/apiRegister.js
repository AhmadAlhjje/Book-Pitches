import {BASE_URL} from './api'

// دالة تسجيل المستخدم
export const registerUser = async (name, phone_number, password) => {
  const response = await fetch(`${BASE_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      phone_number,
      password,
      user_type: 'regular',
    }),
  });

  if (!response.ok) throw new Error("فشل في تسجيل المستخدم");
  return response.text();
};