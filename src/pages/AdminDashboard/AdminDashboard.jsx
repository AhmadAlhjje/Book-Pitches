import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
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
    const fetchFieldAndBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const userId = JSON.parse(atob(token.split('.')[1])).id;
  
        // جلب id الملعب الخاص بالمستخدم
        const fieldResponse = await fetch(`http://localhost:4000/field_owners/field_by_user/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const fieldData = await fieldResponse.json();
        
        // جلب جميع الملاعب من API
        const fieldsResponse = await fetch(`http://localhost:4000/fields/${fieldData.field_id}`);
        const fieldsData = await fieldsResponse.json();
  
        // البحث عن اسم الملعب المطابق
        const matchedField = fieldsData;
  
        setFieldDetails(prev => ({
          ...prev,
          fieldId: fieldData.field_id,
          name: matchedField ? matchedField.name : 'غير معروف',
          description: fieldData.description,
          image: fieldData.image || null,
        }));
  
        // جلب الحجوزات الخاصة بالملعب
        const bookingsResponse = await fetch(`http://localhost:4000/reservations/field/${fieldData.field_id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
        setFieldName(matchedField ? matchedField.name : 'غير معروف');
  
      } catch (error) {
        console.error('فشل في جلب بيانات الملعب والحجوزات:', error);
        setError('فشل في جلب بيانات الملعب والحجوزات.');
      }
    };
  
    fetchFieldAndBookings();
  }, []);
  

  const getWeekStart = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  };

  const weekStart = getWeekStart(new Date(currentWeek));
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const handleWeekChange = (direction) => {
    const newWeek = new Date(weekStart);
    newWeek.setDate(weekStart.getDate() + direction * 7);
    setCurrentWeek(newWeek);
  };

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

      const response = await fetch('http://localhost:4000/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'فشل في إضافة الحجز.');
      }
    } catch (error) {
      console.error('حدث خطأ أثناء إضافة الحجز:', error);
      setError('حدث خطأ يرجى المحاولة لاحقًا.');
    }
  };

  const handleCancelBooking = async (date, time) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('يرجى تسجيل الدخول أولاً.');
        return;
      }

      const response = await fetch(`http://localhost:4000/reservations`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ date, time }),
      });

      if (response.ok) {
        setBookings(bookings.filter(booking => !(booking.date === date && booking.time === time)));
        setError('');
      } else {
        setError('فشل في إلغاء الحجز.');
      }
    } catch (error) {
      console.error('حدث خطأ أثناء إلغاء الحجز:', error);
      setError('حدث خطأ يرجى المحاولة لاحقًا.');
    }
  };

  const handleEditFieldDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('يرجى تسجيل الدخول أولاً.');
        return;
      }

      const fieldId = fieldDetails.fieldId;
      const formData = new FormData();
      formData.append('name', fieldDetails.name);
      formData.append('details', fieldDetails.description);
      fieldDetails.images.forEach((image, index) => {
        if (image) {
          formData.append(`image${index + 1}`, image);
        }
      });

      const response = await fetch(`http://localhost:4000/fields/${fieldId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      
      if (response.ok) {
        setShowEditModal(false);
        setError('');
        window.location.reload();
      } else {
        const errorData = await response.text();
        setError(errorData.message || 'فشل في حفظ التعديلات.');
      }
    } catch (error) {
      console.error('فشل في تعديل تفاصيل الملعب:', error);
      setError('حدث خطأ يرجى المحاولة لاحقًا.');
    }
  };

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
      {/* عرض اسم الملعب في المنتصف */}
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
