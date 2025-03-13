import {BASE_URL} from './api'

//  دالة جلب جميع المدن
export const fetchCities = async () => {
    const response = await fetch(`${BASE_URL}/cities`);
    if (!response.ok) throw new Error("فشل في جلب بيانات المدن");
    return response.json();
  };
  
  
// دالة لإضافة مدينة جديدة
  export const addCity = async (cityName, token) => {
    const response = await fetch(`${BASE_URL}/cities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: cityName }),
    });
  
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'حدث خطأ أثناء إضافة المدينة.');
    }
  
    return response.text(); 
  };