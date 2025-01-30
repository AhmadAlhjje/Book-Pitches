import React from 'react'; 
import { Row, Col, Card } from 'react-bootstrap'; 
import './BookingsList.css'; 

// مكون لعرض قائمة الحجوزات
const BookingsList = ({ bookings, getBookingStatus }) => (
  <Row>
    {bookings.length > 0 ? (
      bookings.map((booking, index) => {
        const status = getBookingStatus(booking.date);
        return (
          <Col md={6} key={index} className="mb-3">
            {/* عرض تفاصيل الحجز مع حالة اللون */}
            <Card className={`shadow-sm ${status === 'منتهية' ? 'bg-danger' : 'bg-success'} text-white`}>
              <Card.Body>
                <Card.Title><strong>{booking.fieldName}</strong></Card.Title>
                <Card.Text>
                  <strong>التاريخ:</strong> {booking.date} <br />
                  <strong>الوقت:</strong> {booking.time} <br />
                  <strong>الحالة:</strong> {status}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        );
      })
    ) : (
      <p>لا توجد حجوزات.</p>
    )}
  </Row>
);

export default BookingsList;
