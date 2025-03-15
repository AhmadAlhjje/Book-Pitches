import {BASE_URL} from './api'

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
  
