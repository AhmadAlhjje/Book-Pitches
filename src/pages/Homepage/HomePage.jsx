import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import FieldCard from "../../components/FieldCard/FieldCard";
import Filters from "../../components/Filters/Filters";
import { fetchRegions, fetchCities } from "../../api/api"; 
import { fetchFields } from "../../api/apiFields"; 
import "./HomePage.css";

const HomePage = () => {
  const [fields, setFields] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredFields, setFilteredFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fieldsData, regionsData, citiesData] = await Promise.all([
          fetchFields(),
          fetchRegions(),
          fetchCities(),
        ]);

        // دمج أسماء المناطق والمدن مع بيانات الملاعب
        const fieldsWithDetails = fieldsData.map((field) => {
          const region = regionsData.find((r) => r.region_id === field.region_id);
          const city = citiesData.find((c) => c.city_id === region?.city_id);
          return {
            ...field,
            regionName: region?.name || "غير محدد",
            cityName: city?.name || "غير محدد",
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

    loadData();
  }, []);

  const handleSearch = (filteredData) => {
    setFilteredFields(filteredData);
  };

  if (loading) return <div className="text-center">جاري تحميل الملاعب...</div>;
  if (error) return <div className="text-center text-danger">خطأ: {error}</div>;

  return (
    <Container fluid className="home-container" dir="rtl">
      <h1 className="text-center title">حجز ملاعب كرة القدم</h1>

      <Filters onSearch={handleSearch} />

      <Row>
        {filteredFields.length > 0 ? (
          filteredFields.map((field) => (
            <Col md={4} key={field.field_id} className="mb-4">
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
