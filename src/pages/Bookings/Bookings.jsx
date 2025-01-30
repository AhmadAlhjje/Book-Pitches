import React, { useEffect, useState } from 'react';
import { Table, Spinner, Alert } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';

const Bookings = () => {
  const [bookings, setBookings] = useState([]); // لحفظ الحجوزات
  const [fields, setFields] = useState([]); // لحفظ الملاعب
  const [loading, setLoading] = useState(true); // لحالة التحميل
  const [error, setError] = useState(null); // لحالة الخطأ

  // دالة لجلب الملاعب من الـ API
  const fetchFields = async () => {
    try {
      const response = await fetch('http://localhost:4000/fields');
      if (!response.ok) {
        throw new Error('حدث خطأ أثناء تحميل الملاعب.');
      }
      const data = await response.json();
      setFields(data);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل الملاعب.');
      setLoading(false);
    }
  };

  // دالة لجلب الحجوزات من الـ API باستخدام fetch
  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('يجب تسجيل الدخول لعرض الحجوزات');
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token); // فك التوكن
      const userId = decodedToken.id;
      
      const response = await fetch(`http://localhost:4000/reservations/user/${userId}`, {
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
      const sortedBookings = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setBookings(sortedBookings);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل البيانات.');
    } finally {
      setLoading(false);
    }
  };

  // تحميل البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchFields();
    fetchBookings();
  }, []);

  // دالة لتحديد حالة الحجز بناءً على التاريخ
  const getRowClass = (bookingDate) => {
    const today = new Date();
    const booking = new Date(bookingDate);
    return booking < today ? 'table-danger' : 'table-success';
  };

  // دالة للحصول على اسم الملعب باستخدام الـ field_id
  const getFieldName = (fieldId) => {
    const field = fields.find(f => f.field_id === fieldId);
    return field ? field.name : 'غير معروف';
  };

  if (loading) return <Spinner animation="border" variant="primary" className="d-block mx-auto" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">حجوزاتي</h2>
      {bookings.length === 0 ? (
        <Alert variant="info">لا توجد حجوزات لعرضها.</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th></th>
              <th>الملعب</th>
              <th>التاريخ</th>
              <th>الوقت</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index} className={getRowClass(booking.date)}>
                <td>{index + 1}</td>
                <td>{getFieldName(booking.field_id)}</td>
                <td>{booking.date}</td>
                <td>{booking.time}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default Bookings;
