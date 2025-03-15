import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import {fetchFieldByUser,fetchFieldById,editFieldDetails} from '../../api/apiFields'
import { addBooking,cancelBooking,fetchBookingsByField } from '../../api/apiReservations'; 
import './AdminDashboard.css';


const AdminDashboard = () => {
  const hours = ['08:00 صباحاً', '10:00 صباحاً', '12:00 ظهراً', '02:00 مساءً', '04:00 مساءً', '06:00 مساءً', '08:00 مساءً'];
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [fieldName, setFieldName] = useState('');
  const [fieldDetails, setFieldDetails] = useState({
    name: '',
    description: '',
    images: [null, null, null, null],
    fieldId: '',
  });

  const [newBooking, setNewBooking] = useState({ day: '', hour: '' });
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    // دالة رئيسية لجلب بيانات الملعب والحجوزات
    const fetchFieldAndBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const userId = JSON.parse(atob(token.split(".")[1])).id;
    
        // جلب بيانات الملعب الخاص بالمستخدم
        const fieldData = await fetchFieldByUser(userId, token);
    
        // جلب بيانات الملعب
        const matchedField = await fetchFieldById(fieldData.field_id);
    
        setFieldDetails(prev => ({
          ...prev,
          fieldId: fieldData.field_id,
          name: matchedField ? matchedField.name : "غير معروف",
          description: matchedField.details,
          image1: matchedField.image1,
          image2: matchedField.image2 ||null,
          image3: matchedField.image3 ||null,
          image4: matchedField.image4 ||null,
        }));
        // جلب الحجوزات
        const bookingsData = await fetchBookingsByField(fieldData.field_id, token);
        setBookings(bookingsData);
        setFieldName(matchedField ? matchedField.name : "غير معروف");
    
      } catch (error) {
        console.error("فشل في جلب بيانات الملعب والحجوزات:", error);
        setError("فشل في جلب بيانات الملعب والحجوزات.");
      }
    };

    fetchFieldAndBookings();
  }, [setFieldDetails, setBookings, setFieldName, setError]);
  

  // يرجع تاريخ بدالة الاسبوع
  const getWeekStart = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  };

  // يرجع مصفوفة فيها جميع ايام الاسبوع بدا من اليوم الحالي
  const weekStart = getWeekStart(new Date(currentWeek));
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  // للتنقل بين الاسابيع (التالي او السابق)
  const handleWeekChange = (direction) => {
    const newWeek = new Date(weekStart);
    newWeek.setDate(weekStart.getDate() + direction * 7);
    setCurrentWeek(newWeek);
  };

  // للتاكد اذا كان هناك حجز ما في الوقت واليوم المحددين
  const isBookingAvailable = (day, hour) => {
    return !bookings.some(booking => booking.date === day && booking.time === hour);
  };
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setNewBooking(prev => ({ ...prev, [name]: value }));
  
    if (newBooking.day && newBooking.hour) {
      const available = isBookingAvailable(newBooking.day, newBooking.hour);
      if (!available) {
        setError('هذا الموعد محجوز مسبقًا. يرجى اختيار موعد آخر.');
      } else {
        setError('');
      }
    }
  };  

// دالة لمعالجة عملية إضافة حجز جديد
const handleAddBooking = async (e) => {
  e.preventDefault();
  const { day, hour } = newBooking;
  if (!day || !hour) {
    setError('يرجى اختيار اليوم والساعة.');
    return;
  }
  if (!isBookingAvailable(day, hour)) {
    setError('هذا الموعد محجوز مسبقًا. يرجى اختيار موعد آخر.');
    return;
  }
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('يرجى تسجيل الدخول أولاً.');
      return;
    }
    const userId = JSON.parse(atob(token.split('.')[1])).id;
    const fieldId = fieldDetails.fieldId;
    const bookingData = {
      time: hour,
      date: new Date(day),
      field_id: fieldId,
      user_id: userId,
    };
    await addBooking(bookingData, token); // استدعاء دالة ارسال الحجوزات
    window.location.reload(); 
  } catch (error) {
    console.error('حدث خطأ أثناء إضافة الحجز:', error);
    setError(error.message || 'حدث خطأ يرجى المحاولة لاحقًا.');
  }
};

// دالة الغاء الحجوزات
const handleCancelBooking = async (date, time) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('يرجى تسجيل الدخول أولاً.');
      return;
    }
    // استدعاء دالة cancelBooking لإلغاء الحجز
    await cancelBooking(date, time, token);
    // تحديث قائمة الحجوزات بعد نجاح الإلغاء
    setBookings(bookings.filter(booking => !(booking.date === date && booking.time === time)));
    setError('');
  } catch (error) {
    console.error('حدث خطأ أثناء إلغاء الحجز:', error);
    setError(error.message || 'حدث خطأ يرجى المحاولة لاحقًا.');
  }
};


// دالة تعديل تفاصيل الملاعب
// مو شغال
const handleEditFieldDetails = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('يرجى تسجيل الدخول أولاً.');
      return;
    }
    // استخراج معرف الملعب
    const fieldId = fieldDetails.fieldId;
    // استدعاء دالة editFieldDetails لإرسال التعديلات إلى API
    await editFieldDetails(fieldId, fieldDetails, token);
    setShowEditModal(false);
    setError('');
    window.location.reload();
  } catch (error) {
    console.error('فشل في تعديل تفاصيل الملعب:', error);
    setError(error.message || 'حدث خطأ يرجى المحاولة لاحقًا.');
  }
};

// تحديث قائمة الصور الخاصة بالملعب
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const index = parseInt(e.target.name);
    if (file) {
      const updatedImages = [...fieldDetails.images];
      updatedImages[index] = file;
      setFieldDetails({ ...fieldDetails, images: updatedImages });
    }
  };

  return (
    <Container className="mt-4 text-white">
      <h2 className="text-center mb-3" style={{ fontWeight: 'bold' }}>{fieldName}</h2>
      <div className="d-flex justify-content-between mb-3">
        <Button variant="secondary" onClick={() => handleWeekChange(-1)}>الأسبوع السابق</Button>
        <Button variant="success" onClick={() => setShowModal(true)}>إضافة حجز</Button>
        <Button variant="secondary" onClick={() => handleWeekChange(1)}>الأسبوع التالي</Button>
      </div>
      <h4 className="mb-3">الأسبوع: {weekStart.toISOString().split('T')[0]}</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button variant="warning" onClick={() => setShowEditModal(true)}>تعديل تفاصيل الملعب</Button>
      <Table bordered className="text-center table">
        <thead>
          <tr>
            <th>الساعة / اليوم</th>
            {days.map((day, i) => (
              <th key={i}>{day} <br /> {weekDates[i].toISOString().split('T')[0]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <td>{hour}</td>
              {days.map((day, i) => {
                const booking = bookings.find(b => b.date === weekDates[i].toISOString().split('T')[0] && b.time === hour);
                return (
                  <td key={i} className={booking ? 'bg-danger text-white' : 'bg-success text-dark'}>
                    {booking ? (
                      <>
                        محجوز <br />
                        <Button variant="danger" onClick={() => handleCancelBooking(weekDates[i].toISOString().split('T')[0], hour)}>
                          إلغاء الحجز
                        </Button>
                      </>
                    ) : 'متاح'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* نافذة إضافة حجز */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>إضافة حجز</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddBooking}>
            <Form.Group>
              <Form.Label>اليوم</Form.Label>
              <Form.Control
                as="select"
                value={newBooking.day}
                onChange={(e) => setNewBooking({ ...newBooking, day: e.target.value })}
              >
                {days.map((day, index) => (
                  <option key={index} value={weekDates[index].toISOString().split('T')[0]}>
                    {day}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>الساعة</Form.Label>
              <Form.Control
                as="select"
                value={newBooking.hour}
                onChange={(e) => setNewBooking({ ...newBooking, hour: e.target.value })}
              >
                {hours.map((hour, index) => (
                  <option key={index} value={hour}>
                    {hour}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button type="submit" variant="success" className="mt-3" disabled={!isBookingAvailable(newBooking.day, newBooking.hour)}>
              حجز
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* نافذة تعديل تفاصيل الملعب */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>تعديل تفاصيل الملعب</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditFieldDetails}>
            <Form.Group>
              <Form.Label>اسم الملعب</Form.Label>
              <Form.Control
                type="text"
                value={fieldDetails.name}
                onChange={(e) => setFieldDetails({ ...fieldDetails, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>وصف الملعب</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={fieldDetails.description}
                onChange={(e) => setFieldDetails({ ...fieldDetails, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>صور الملعب</Form.Label>
              {fieldDetails.images.map((image, index) => (
                <div key={index}>
                  <Form.Control
                    type="file"
                    name={index}
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  {image && <img src={URL.createObjectURL(image)} alt={`صورة ${index}`} width="100" />}
                </div>
              ))}
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">حفظ التعديلات</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
