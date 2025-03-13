import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { fetchCities ,addCity } from '../../api/apiCities'; 
import { addRegion } from '../../api/apiRegions'; 

const AddCityRegion = () => {
  const [city, setCity] = useState(''); 
  const [cityName, setCityName] = useState(''); 
  const [region, setRegion] = useState('');
  const [message, setMessage] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const [cities, setCities] = useState([]); 

  const token = localStorage.getItem('token'); 

  useEffect(() => {
    const getCities = async () => {
      try {
        const data = await fetchCities();
        setCities(data); 
      } catch (error) {
        setMessage('حدث خطأ أثناء تحميل المدن.');
      }
    };
  
    getCities();
  }, []);
  
  // إضافة مدينة جديدة
  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!cityName) {
      setMessage('يرجى إدخال المدينة.');
      return;
    }
    setIsLoading(true);
    try {
      if (!token) {
        setMessage('لم يتم العثور على التوكن، الرجاء تسجيل الدخول.');
        return;
      }
      await addCity(cityName, token); 
      setMessage('تم إضافة المدينة بنجاح!');
      setCityName(''); 
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // إضافة منطقة جديدة بناءً على المدينة
const handleAddRegion = async (e) => {
  e.preventDefault();
  
  if (!region || !city) {
    setMessage('يرجى إدخال المدينة والمنطقة.');
    return;
  }
  setIsLoading(true);
  try {
    if (!token) {
      setMessage('لم يتم العثور على التوكن، الرجاء تسجيل الدخول.');
      return;
    }
    // الحصول على اسم المدينة من خلال ال id
    // هل هذه العملية اذا كانت باك افضل؟؟؟؟ ام هل سوف يكون هناك تحميل
    const selectedCity = cities.find((c) => c.city_id === parseInt(city)); 
    const cityName = selectedCity ? selectedCity.name : ''; 

    await addRegion(region, cityName, token); 
    setMessage('تم إضافة المنطقة بنجاح!');
    setRegion(''); 
  } catch (error) {
    console.error('خطأ أثناء الاتصال بالخادم:', error);
    setMessage(error.message);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div style={{ maxWidth: '600px', margin: 'auto', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
      <h3 className="mb-4 text-center">إضافة مدينة ومنطقة</h3>
      {message && <Alert variant={message.includes('نجاح') ? 'success' : 'danger'}>{message}</Alert>}
      {/* نموذج إضافة مدينة */}
      <Form onSubmit={handleAddCity}>
        <Form.Group className="mb-3">
          <Form.Label>المدينة</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم المدينة"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
          {isLoading ? 'جاري الإضافة...' : 'إضافة مدينة'}
        </Button>
      </Form>
      <hr />

      {/* نموذج إضافة منطقة */}
      <Form onSubmit={handleAddRegion}>
        <Form.Group className="mb-3">
          <Form.Label>المدينة</Form.Label>
          <Form.Control
            as="select"
            value={city}
            onChange={(e) => setCity(e.target.value)} // تخزين الـ city_id عند اختيار المدينة
          >
            <option value="">اختر المدينة</option>
            {cities.map((city) => (
              <option key={city.city_id} value={city.city_id}>
                {city.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>المنطقة</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم المنطقة"
            value={region}
            onChange={(e) => setRegion(e.target.value)} // تحديث قيمة اسم المنطقة
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
          {isLoading ? 'جاري الإضافة...' : 'إضافة منطقة'}
        </Button>
      </Form>
    </div>
  );
};

export default AddCityRegion;
