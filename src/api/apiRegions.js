import {BASE_URL} from './api'

//  دالة جلب جميع المناطق
export const fetchRegions = async () => {
  const response = await fetch(`${BASE_URL}/regions`);
  if (!response.ok) throw new Error("فشل في جلب بيانات المناطق");
  return response.json();
};