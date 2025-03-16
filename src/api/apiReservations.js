import {BASE_URL} from './api'
import {jwtDecode} from 'jwt-decode';

// دالة جلب الحجوزات الخاصة بالملعب
export const fetchBookingsByField = async (fieldId, token) => {
    const response = await fetch(`${BASE_URL}/reservations/field/${fieldId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("فشل في جلب الحجوزات");
    return response.json();
  };

// دالة ارسال الحجوزرات 
export const addBooking = async (bookingData, token) => {
    try {
      const response = await fetch('http://localhost:4000/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في إضافة الحجز.');
      }
  
      return response.text();
    } catch (error) {
      throw error;
    }
  };

  // دالة لإلغاء الحجز  
export const cancelBooking = async (date, time, token) => {
    try {
      const response = await fetch(`http://localhost:4000/reservations`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ date, time }),
      });
  
      if (!response.ok) {
        throw new Error('فشل في إلغاء الحجز.');
      }
  
      return true; 
    } catch (error) {
      throw error;
    }
  };
  

  // دالة جلب الحجوزات الختصة بشخض معين
  export const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('يجب تسجيل الدخول لعرض الحجوزات');
    }
    try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        const response = await fetch(`${BASE_URL}/reservations/user/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('حدث خطأ أثناء تحميل البيانات.');
        }
        const data = await response.json();
        return data.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (err) {
        throw new Error(err.message || 'حدث خطأ أثناء تحميل البيانات.');
    }
};