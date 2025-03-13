export const BASE_URL = "http://localhost:4000";

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


