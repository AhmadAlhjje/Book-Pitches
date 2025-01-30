import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Carousel, Button } from 'react-bootstrap';
import './FieldDetails.css';

const FieldDetails = () => {
  const { id } = useParams(); // جلب معرف الملعب من المعاملات في URL
  const navigate = useNavigate(); // إدارة التنقل بين الصفحات
  const [field, setField] = useState(null); // بيانات الملعب
  const [error, setError] = useState(null); // رسائل الأخطاء
  const [regions, setRegions] = useState([]); // بيانات المناطق
  const [cities, setCities] = useState([]); // بيانات المدن

  // دالة للحصول على اسم المنطقة بناءً على region_id
  const getRegionName = (regionId) => {
    const region = regions.find((region) => region.region_id === regionId);
    return region ? region.name : 'منطقة غير معروفة';
  };

  // دالة للحصول على اسم المدينة بناءً على city_id
  const getCityName = (regionId) => {
    const region = regions.find((region) => region.region_id === regionId);
    if (region) {
      const city = cities.find((city) => city.city_id === region.city_id);
      return city ? city.name : 'مدينة غير معروفة';
    }
    return 'مدينة غير معروفة';
  };

  // جلب بيانات المناطق
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

  // جلب بيانات المدن
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

  // جلب بيانات الملعب
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

  // عرض رسالة خطأ إذا حدث خطأ أثناء جلب البيانات
  if (error) {
    return <p className="text-danger text-center mt-5">حدث خطأ: {error}</p>;
  }

  // عرض رسالة تحميل إذا كانت البيانات غير جاهزة
  if (!field || regions.length === 0 || cities.length === 0) {
    return <p className="text-light text-center mt-5">جارٍ تحميل بيانات الملعب والمناطق والمدن...</p>;
  }

  // عرض تفاصيل الملعب
  return (
    <Container className="mt-4 field-details-container" dir="rtl">
      <Row>
        {/* عرض الصور باستخدام Carousel */}
        <Col md={8} className="mb-4">
          <Carousel className="field-carousel shadow">
            {[field.image1, field.image2, field.image3]
              .filter(image => image) // تصفية الصور غير المتاحة
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

        {/* تفاصيل الملعب */}
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
          <Button
            variant="success"
            className="mt-3"
            onClick={() => navigate(`/field/${field.field_id}/booking`)}
          >
            احجز الآن
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default FieldDetails;
