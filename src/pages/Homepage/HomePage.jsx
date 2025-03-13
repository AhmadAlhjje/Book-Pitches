import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import FieldCard from '../../components/FieldCard/FieldCard';
import Filters from '../../components/Filters/Filters';
import './HomePage.css';
// import { Link } from 'react-router-dom';

const HomePage = () => {
  const [fields, setFields] = useState([]);  // لتخزين جميع الملاعب
  const [regions, setRegions] = useState([]); // لتخزين المناطق
  const [cities, setCities] = useState([]);   // لتخزين المدن
  const [filteredFields, setFilteredFields] = useState([]); // لتخزين الملاعب بعد الفلترة
  const [filters, setFilters] = useState({ location: '', region: '', city: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تحميل البيانات من الـ API   localhost
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const fieldsResponse = await fetch('http://localhost:4000/fields');
        const regionsResponse = await fetch('http://localhost:4000/regions');
        const citiesResponse = await fetch('http://localhost:4000/cities');
        
        if (!fieldsResponse.ok || !regionsResponse.ok || !citiesResponse.ok) {
          throw new Error('فشل في جلب البيانات');
        }

        const fieldsData = await fieldsResponse.json();
        const regionsData = await regionsResponse.json();
        const citiesData = await citiesResponse.json();

        // دمج البيانات مع الأسماء الخاصة بالمناطق والمدن
        const fieldsWithDetails = fieldsData.map(field => {
          const region = regionsData.find(region => region.region_id === field.region_id);
          const city = citiesData.find(city => city.city_id === region?.city_id);
          return {
            ...field,
            regionName: region?.name || 'غير محدد',
            cityName: city?.name || 'غير محدد'
          };
        });

        setFields(fieldsWithDetails);
        setFilteredFields(fieldsWithDetails);
        setRegions(regionsData);
        setCities(citiesData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  // التعامل مع تغييرات الفلترة
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // البحث وتطبيق الفلترة على الملاعب
  const handleSearch = (filteredData) => {
    setFilteredFields(filteredData);
  };

  // تصفية الملاعب بناءً على الفلاتر
  useEffect(() => {
    const filtered = fields.filter(field => {
      const matchesLocation = filters.location ? field.name.includes(filters.location) : true;
      const matchesRegion = filters.region ? field.regionName === filters.region : true;
      const matchesCity = filters.city ? field.cityName === filters.city : true;
      return matchesLocation && matchesRegion && matchesCity;
    });

    setFilteredFields(filtered);
  }, [filters, fields]);

  // عرض رسالة تحميل إذا كانت البيانات لا تزال قيد التحميل
  if (loading) {
    return <div className="text-center">جاري تحميل الملاعب...</div>;
  }

  // عرض رسالة خطأ إذا حدثت مشكلة في جلب البيانات
  if (error) {
    return <div className="text-center text-danger">خطأ: {error}</div>;
  }

  return (
    <Container fluid className="home-container" dir="rtl">
      <h1 className="text-center title">حجز ملاعب كرة القدم</h1>

      <Filters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch} // تمرير الدالة إلى Filters.jsx
        regions={regions}
        cities={cities}
      />

      <Row>
        {filteredFields.length > 0 ? (
          filteredFields.map((field) => (
            <Col md={4} key={field.field_id} className="mb-4">
              {/* تمرير regions و cities إلى FieldCard */}
              <FieldCard field={field} regions={regions} cities={cities} />
            </Col>
          ))
        ) : (
          <Col>
            <p className="text-center">عذرًا، لا توجد ملاعب متوفرة وفقًا لمعايير البحث الخاصة بك.</p>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default HomePage;
