import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import "./Filters.css";

const Filters = ({ onSearch }) => {
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [filters, setFilters] = useState({ name: "", city: "", region: "" });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('http://localhost:4000/cities');
        const data = await response.json();
        if (response.ok) {
          setCities(data);
        } else {
          setError('حدث خطأ أثناء جلب المدن.');
        }
      } catch (error) {
        setError('حدث خطأ أثناء الاتصال بالخادم.');
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch('http://localhost:4000/regions');
        const data = await response.json();
        if (response.ok) {
          setRegions(data);
        } else {
          setError('حدث خطأ أثناء جلب المناطق.');
        }
      } catch (error) {
        setError('حدث خطأ أثناء الاتصال بالخادم.');
      }
    };

    fetchRegions();
  }, []);
  
  const getCityIdByName = (cityName) => {
    const city = cities.find(city => city.name === cityName);
    return city ? city.city_id : null;
  };

  const filteredRegions = regions.filter(region => region.city_id === getCityIdByName(filters.city));

  // 🔹 تحديث حالة الفلاتر فقط بدون تنفيذ البحث التلقائي
  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  // 🔹 البحث فقط عند النقر على زر البحث
  const handleSearch = async () => {
    try {
      const url = new URL('http://localhost:4000/fields/search');
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        field_name: filters.name,
        city_name: filters.city,
        region_name: filters.region,
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        setError("لا يوجد ملاعب.");
        onSearch([]);
        return;
      }

      if (!response.ok) throw new Error('فشل في جلب البيانات');
      
      const data = await response.json();
      setError(null);
      onSearch(data);
    } catch (error) {
      console.error('Error fetching fields:', error);
      setError('حدث خطأ أثناء البحث. حاول مرة أخرى.');
    }
  };

  return (
    <div>
      <Form className="filters mb-4">
        <Row className="align-items-end">
          <Col md={4}>
            <Form.Label className='FormLabel'>بحث حسب اسم الملعب</Form.Label>
            <Form.Control
              type="text"
              placeholder="ابحث حسب اسم الملعب..."
              name="name"
              value={filters.name}
              onChange={handleFilterChange}  // ✅ لا يتم البحث تلقائيًا
            />
          </Col>
          <Col md={4}>
            <Form.Label className='FormLabel'>المدينة</Form.Label>
            <Form.Select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}  // ✅ لا يتم البحث تلقائيًا
            >
              <option value="">الكل</option>
              {cities.map((city) => (
                <option key={city.city_id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label className='FormLabel'>المنطقة</Form.Label>
            <Form.Select
              name="region"
              value={filters.region}
              onChange={handleFilterChange}  // ✅ لا يتم البحث تلقائيًا
            >
              <option value="">الكل</option>
              {filteredRegions.map((region) => (
                <option key={region.region_id} value={region.name}>
                  {region.name}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col>
            <div className="d-flex justify-content-center">
              <Button
                variant="success"
                className="w-25"
                onClick={handleSearch}  // ✅ البحث يتم فقط عند النقر على الزر
              >
                بحث
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      {error && <p className="text-danger text-center">{error}</p>}
    </div>
  );
};

export default Filters;
