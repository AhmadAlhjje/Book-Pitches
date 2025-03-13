import {BASE_URL} from './api'

// دالة لتسجيل الدخول
export const loginUser = async (phone_number, password) => {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone_number, password }),
  });

  if (!response.ok) {
    throw new Error('فشل في تسجيل الدخول');
  }

  const data = await response.json();
  return data;  
};

// دالة إرسال طلب للتحقق من نوع المستخدم 
export const getUserData = async (userId, token) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const userData = await response.json();
  
      if (!response.ok) {
        throw new Error(userData.message || "فشل في التحقق من بيانات المستخدم.");
      }
  
      return userData;
    } catch (error) {
      console.error("خطأ أثناء جلب بيانات المستخدم:", error);
      throw error;
    }
  };
  