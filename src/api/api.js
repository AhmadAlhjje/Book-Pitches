export const BASE_URL = "http://localhost:4000";

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
  return response.text(); // إرجاع البيانات من الاستجابة (مثل معرف المستخدم أو رسالة نجاح)
};

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
  return data;  // إعادة البيانات (مثلاً: رمز التوكن أو تفاصيل المستخدم)
};


//  دالة جلب جميع الملاعب
export const fetchFields = async () => {
  const response = await fetch(`${BASE_URL}/fields`);
  if (!response.ok) throw new Error("فشل في جلب بيانات الملاعب");
  return response.json();
};

//  دالة جلب جميع المناطق
export const fetchRegions = async () => {
  const response = await fetch(`${BASE_URL}/regions`);
  if (!response.ok) throw new Error("فشل في جلب بيانات المناطق");
  return response.json();
};

//  دالة جلب جميع المدن
export const fetchCities = async () => {
  const response = await fetch(`${BASE_URL}/cities`);
  if (!response.ok) throw new Error("فشل في جلب بيانات المدن");
  return response.json();
};

//  دالة البحث عن الملاعب
export const searchFields = async (filters) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams({
    field_name: filters.name || "",
    city_name: filters.city || "",
    region_name: filters.region || "",
  });

  const response = await fetch(`${BASE_URL}/fields/search?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) return [];
  if (!response.ok) throw new Error("فشل في البحث عن الملاعب");
  
  return response.json();
};
