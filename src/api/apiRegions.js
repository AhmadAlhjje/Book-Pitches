import {BASE_URL} from './api'

//  دالة جلب جميع المناطق
export const fetchRegions = async () => {
  const response = await fetch(`${BASE_URL}/regions`);
  if (!response.ok) throw new Error("فشل في جلب بيانات المناطق");
  return response.json();
};

// دالة لإضافة منطقة جديدة
export const addRegion = async (regionName, cityName, token) => {
  const response = await fetch(`${BASE_URL}/regions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: regionName, city_name: cityName }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || 'حدث خطأ أثناء إضافة المنطقة.');
  }

  return response.text();
};