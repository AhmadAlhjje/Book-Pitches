import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Calendar from 'react-calendar';
import { useParams, useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    const fetchFieldData = async () => {
      try {
        const response = await fetch('http://localhost:4000/fields');
        const fields = await response.json();
        const currentField = fields.find(field => field.field_id === parseInt(id));
        setFieldData(currentField);
      } catch (error) {
        console.error('Error fetching field data:', error);
      }
    };

    fetchFieldData();
  }, [id]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`http://localhost:4000/reservations/field/${id}`);
        const data = await response.json();
        const bookingsByDate = {};

        data.forEach(booking => {
          const { date, time } = booking;
          const dateKey = new Date(date).toLocaleDateString('en-CA');
          if (!bookingsByDate[dateKey]) bookingsByDate[dateKey] = [];
          bookingsByDate[dateKey].push(time);
        });

        setBookedTimes(bookingsByDate);
      } catch (error) {
        setMessage({ type: 'error', text: 'حدث خطأ أثناء جلب بيانات الحجوزات. يرجى المحاولة لاحقاً.' });
        console.error('Error fetching bookings:', error);
      }
    };

    if (id) fetchBookings();
  }, [id]);

  const handleDateChange = (date) => {
    const correctedDate = new Date(date);
    correctedDate.setHours(0, 0, 0, 0);
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

    const dateKey = selectedDate.toLocaleDateString('en-CA');
    if (bookedTimes[dateKey]?.includes(selectedTime)) {
      setMessage({ type: 'error', text: 'هذا الوقت محجوز مسبقاً. يرجى اختيار وقت آخر.' });
      return;
    }

    const token = localStorage.getItem('token');
    const formattedDate = selectedDate.toLocaleDateString('en-CA');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

    const bookingDetails = {
      field_id: id,
      date: formattedDate,
      time: selectedTime,
      user_id: userId,
    };

    try {
      const response = await fetch('http://localhost:4000/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingDetails),
      });

      const data = await response.text();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `تم تأكيد الحجز ليوم ${formattedDate} في الساعة ${selectedTime}.`,
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'حدث خطأ أثناء الحجز.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "حدث خطأ أثناء الاتصال بالخادم." });
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
    const dateKey = date.toLocaleDateString('en-CA');
    const currentDate = new Date().toLocaleDateString('en-CA');

    if (dateKey < currentDate) return 'past-date';
    if (bookedTimes[dateKey]) {
      const bookedTimesForDate = bookedTimes[dateKey];
      if (bookedTimesForDate.length === timeSlots.length) return 'fully-booked';
      if (bookedTimesForDate.length === 0) return 'fully-available';
      return 'partially-available';
    }
    return 'fully-available';
  };

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
