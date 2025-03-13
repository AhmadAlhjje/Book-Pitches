import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { fetchCities, fetchRegions, searchFields } from '../../api/api';
import "./Filters.css";

const Filters = ({ onSearch }) => {
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [filters, setFilters] = useState({ name: "", city: "", region: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regionsData, citiesData] = await Promise.all([
                  fetchRegions(),
                  fetchCities(),
                ]);
        setCities(citiesData);
        setRegions(regionsData);
      } catch (error) {
        setError('حدث خطأ أثناء جلب البيانات.');
      }
    };
    fetchData();
  }, []);


  const getCityIdByName = (cityName) => {
    const city = cities.find(city => city.name === cityName);
    return city ? city.city_id : null;
  };
  const filteredRegions = regions.filter(region => region.city_id === getCityIdByName(filters.city));

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const handleSearch = async () => {
    try {
      const data = await searchFields(filters);
      if (data.length === 0) {
        setError("لا يوجد ملاعب.");
      } else {
        setError(null);
      }
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
              onChange={handleFilterChange} 
            />
          </Col>
          <Col md={4}>
            <Form.Label className='FormLabel'>المدينة</Form.Label>
            <Form.Select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}  
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
              onChange={handleFilterChange} 
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
                onClick={handleSearch} 
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
