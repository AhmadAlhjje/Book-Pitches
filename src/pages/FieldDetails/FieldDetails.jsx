import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Carousel, Button, Modal } from 'react-bootstrap';
import './FieldDetails.css';

const FieldDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [showModal, setShowModal] = useState(false); // ✅ حالة للتحكم في عرض النافذة المنبثقة

  const getRegionName = (regionId) => {
    const region = regions.find((region) => region.region_id === regionId);
    return region ? region.name : 'منطقة غير معروفة';
  };

  const getCityName = (regionId) => {
    const region = regions.find((region) => region.region_id === regionId);
    if (region) {
      const city = cities.find((city) => city.city_id === region.city_id);
      return city ? city.name : 'مدينة غير معروفة';
    }
    return 'مدينة غير معروفة';
  };

  useEffect(() => {
    const fetchRegionsData = async () => {
      try {
        const response = await fetch('http://localhost:4000/regions');
        if (!response.ok) throw new Error(`خطأ في الاستجابة! الحالة: ${response.status}`);
        const regionsData = await response.json();
        setRegions(regionsData);
      } catch (err) {
        console.error('خطأ في جلب بيانات المناطق:', err);
        setError(err.message);
      }
    };
    fetchRegionsData();
  }, []);

  useEffect(() => {
    const fetchCitiesData = async () => {
      try {
        const response = await fetch('http://localhost:4000/cities');
        if (!response.ok) throw new Error(`خطأ في الاستجابة! الحالة: ${response.status}`);
        const citiesData = await response.json();
        setCities(citiesData);
      } catch (err) {
        console.error('خطأ في جلب بيانات المدن:', err);
        setError(err.message);
      }
    };
    fetchCitiesData();
  }, []);

  useEffect(() => {
    const fetchFieldData = async () => {
      try {
        const response = await fetch('http://localhost:4000/fields');
        if (!response.ok) throw new Error(`خطأ في الاستجابة! الحالة: ${response.status}`);
        const fields = await response.json();
        const selectedField = fields.find((field) => field.field_id === parseInt(id, 10));
        if (!selectedField) throw new Error('لم يتم العثور على الملعب المطلوب');
        setField(selectedField);
      } catch (err) {
        console.error('خطأ في جلب بيانات الملعب:', err);
        setError(err.message);
      }
    };
    fetchFieldData();
  }, [id]);

  const handleBooking = () => {
    const token = localStorage.getItem('token'); // ✅ التحقق من تسجيل الدخول
    if (!token) {
      setShowModal(true); // ✅ إظهار النافذة المنبثقة عند عدم تسجيل الدخول
    } else {
      navigate(`/field/${field.field_id}/booking`);
    }
  };

  if (error) {
    return <p className="text-danger text-center mt-5">حدث خطأ: {error}</p>;
  }

  if (!field || regions.length === 0 || cities.length === 0) {
    return <p className="text-light text-center mt-5">جارٍ تحميل بيانات الملعب والمناطق والمدن...</p>;
  }

  return (
    <Container className="mt-4 field-details-container" dir="rtl">
      <Row>
        <Col md={8} className="mb-4">
          <Carousel className="field-carousel shadow">
            {[field.image1, field.image2, field.image3]
              .filter(image => image)
              .map((image, index) => (
                <Carousel.Item key={index}>
                  <img
                    className="d-block w-100 carousel-image"
                    src={`http://localhost:4000/uploads/${image.split('\\').pop()}`}
                    alt={`صورة للملعب ${index + 1}`}
                  />
                </Carousel.Item>
              ))}
          </Carousel>
        </Col>

        <Col md={4} className="text-light field-info">
          <h2 className="field-name">{field.name}</h2>
          <p className="field-location">
            <strong>المنطقة :</strong> {getRegionName(field.region_id)}
          </p>
          <p className="field-city">
            <strong>المدينة :</strong> {getCityName(field.region_id)}
          </p>
          <p className="field-type">
            <strong>التفاصيل :</strong> {field.details || 'غير محدد'}
          </p>

          <Button variant="success" className="mt-3" onClick={handleBooking}>
            احجز الآن
          </Button>
        </Col>
      </Row>

      {/* ✅ النافذة المنبثقة */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="text-center p-4">
          <h4 className="text-danger mb-3">يرجى تسجيل الدخول</h4>
          <p>يجب عليك تسجيل الدخول لحجز الملعب.</p>
          <Button variant="primary" onClick={() => navigate('/login')} className="mx-2">
            تسجيل الدخول
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            إغلاق
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default FieldDetails;
