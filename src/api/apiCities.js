import {BASE_URL} from './api'

//  دالة جلب جميع المدن
export const fetchCities = async () => {
    const response = await fetch(`${BASE_URL}/cities`);
    if (!response.ok) throw new Error("فشل في جلب بيانات المدن");
    return response.json();
  };
  