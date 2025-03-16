import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Calendar from 'react-calendar';
import { useParams, useNavigate } from 'react-router-dom';
import {fetchFields} from '../../api/apiFields'
import {fetchBookingsByField,addBooking} from '../../api/apiReservations'
import 'react-calendar/dist/Calendar.css';
import './BookingPage.css';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState({});
  const [message, setMessage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [fieldData, setFieldData] = useState(null);

  const timeSlots = [
    '08:00 صباحاً', '10:00 صباحاً', '12:00 ظهراً', '02:00 مساءً',
    '04:00 مساءً', '06:00 مساءً', '08:00 مساءً',
  ];

  const token = localStorage.getItem('token');
  const dateKey = selectedDate.toLocaleDateString('en-CA');

useEffect(() => {
  const fetchData = async () => {
    try {
      // **جلب بيانات الملعب**
      const fields = await fetchFields();
      const currentField = fields.find(field => field.field_id === parseInt(id, 10));
      setFieldData(currentField);

      // **جلب بيانات الحجوزات**
      if (!token) throw new Error('لم يتم العثور على رمز المصادقة');
      const data = await fetchBookingsByField(id, token);
      const bookingsByDate = {};
      data.forEach(booking => {
        const { date, time } = booking;
        const dateKey = new Date(date).toLocaleDateString('en-CA');
        if (!bookingsByDate[dateKey]) bookingsByDate[dateKey] = [];
        bookingsByDate[dateKey].push(time);
      });
      setBookedTimes(bookingsByDate);
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء جلب البيانات. يرجى المحاولة لاحقاً.' });
      console.error('Error fetching data:', error);
    }
  };
  if (id) fetchData();
}, [id, token]); 


  const handleDateChange = (date) => {
    const correctedDate = new Date(date);// تحويل `date` إلى كائن `Date`
    correctedDate.setHours(0, 0, 0, 0);// إعادة تعيين الوقت إلى منتصف الليل (00:00:00.000)
    setSelectedDate(correctedDate);
  };

  const handleTimeChange = (e) => setSelectedTime(e.target.value);
  const handlePaymentChange = (e) => setPaymentMethod(e.target.value);


  const handleBooking = async () => {
    if (!selectedTime) {
      setMessage({ type: 'error', text: 'يرجى اختيار وقت لإتمام عملية الحجز.' });
      return;
    }

    if (!paymentMethod) {
      setMessage({ type: 'error', text: 'يرجى اختيار طريقة الدفع.' });
      return;
    }

    const currentDate = new Date();
    const selectedDateTime = new Date(selectedDate);
    const [hours] = selectedTime.split(' ');
    selectedDateTime.setHours(parseInt(hours), 0);

    if (selectedDateTime < currentDate) {
      setMessage({ type: 'error', text: 'لا يمكن حجز ملعب لتاريخ أو وقت قديم.' });
      return;
    }

    
    if (bookedTimes[dateKey]?.includes(selectedTime)) {
      setMessage({ type: 'error', text: 'هذا الوقت محجوز مسبقاً. يرجى اختيار وقت آخر.' });
      return;
    }

    if (!token) {
      setMessage({ type: 'error', text: 'يجب تسجيل الدخول لإتمام الحجز.' });
      return;
    }

    const userId = JSON.parse(atob(token.split('.')[1])).id;
    const bookingDetails = {
      field_id: id,
      date: dateKey,
      time: selectedTime,
      user_id: userId,
    };

    try {
      const responseMessage = await addBooking(bookingDetails, token); 
      setMessage({
        type: 'success',
        text: `تم تأكيد الحجز ليوم ${dateKey} في الساعة ${selectedTime}.`,
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ أثناء الحجز.' });
    }
  };


  const handleCloseMessage = () => {
    if (message.type === 'success') {
      navigate('/bookings');
    } else {
      setMessage(null);
    }
  };

  const getDateStatusClass = (date) => {
    const currentDate = new Date().toLocaleDateString('en-CA');
    if (dateKey < currentDate) return 'past-date';
    if (bookedTimes[dateKey]) {
      const bookedTimesForDate = bookedTimes[dateKey];
      // اليوم محجوز بالكامل
      if (bookedTimesForDate.length === timeSlots.length) return 'fully-booked';
      // اليوم متاح بالكامل
      if (bookedTimesForDate.length === 0) return 'fully-available';
      // متاح بعض الاوقات في اليوم
      return 'partially-available';
    }
    return 'fully-available';
  };

  // تعطيل التواريخ قبل تاريخ اليوم
  const disablePastDates = ({ date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Container className="booking-page d-flex align-items-center justify-content-center">
      <div className="booking-card text-center p-4 shadow-lg">
        <h2 className="mb-4">حجز الملعب</h2>
        <p>قم باختيار التاريخ والوقت لحجز الملعب.</p>

        {fieldData && <h4>{fieldData.name}</h4>}

        <Row className="mt-3">
          <Col>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              className="custom-calendar"
              locale="ar"
              tileClassName={({ date }) => getDateStatusClass(date)}
              tileDisabled={disablePastDates}
            />
          </Col>
        </Row>

        <Row>
          <Col className="mt-3">
            <Form>
              <Form.Group controlId="formTime">
                <Form.Label>اختار الوقت</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedTime}
                  onChange={handleTimeChange}
                >
                  <option value="">اختر وقتاً</option>
                  {timeSlots.map((timeSlot, index) => (
                    <option
                      key={index}
                      value={timeSlot}
                      disabled={bookedTimes[selectedDate.toLocaleDateString('en-CA')]?.includes(timeSlot)}
                    >
                      {timeSlot}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formPayment">
                <Form.Label>طريقة الدفع</Form.Label>
                <Form.Control
                  as="select"
                  value={paymentMethod}
                  onChange={handlePaymentChange}
                >
                  <option value="">اختر طريقة الدفع</option>
                  <option value="electronic">دفع إلكتروني</option>
                  <option value="cash">دفع نقدي</option>
                </Form.Control>
              </Form.Group>
            </Form>
          </Col>
        </Row>

        <Button variant="primary" className="mt-4" onClick={handleBooking}>
          تأكيد الحجز
        </Button>

        {message && (
          <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
            {message.text}
            <button type="button" className="close" aria-label="Close" onClick={handleCloseMessage}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )}
      </div>
    </Container>
  );
};

export default BookingPage;
