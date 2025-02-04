import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

const AddCityRegion = () => {
  const [city, setCity] = useState(''); // لتخزين city_id (اختيار المدينة)
  const [cityName, setCityName] = useState(''); // لتخزين اسم المدينة (إضافة مدينة جديدة)
  const [region, setRegion] = useState(''); // لتخزين اسم المنطقة
  const [message, setMessage] = useState(''); // لتخزين الرسائل الناتجة عن العمليات
  const [isLoading, setIsLoading] = useState(false); // للتحكم في حالة التحميل
  const [cities, setCities] = useState([]); // لتخزين قائمة المدن

  const token = localStorage.getItem('token'); // الحصول على التوكن من localStorage

  // استدعاء المدن عند تحميل الصفحة
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('http://localhost:4000/cities');
        const data = await response.json();
        if (response.ok) {
          setCities(data); // تخزين المدن في المتغير cities
        } else {
          setMessage('حدث خطأ أثناء تحميل المدن.');
        }
      } catch (error) {
        setMessage('حدث خطأ أثناء الاتصال بالخادم.');
      }
    };

    fetchCities();
  }, []);
  // إضافة مدينة جديدة
  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!cityName) {
      setMessage('يرجى إدخال المدينة.');
      return;
    }

    setIsLoading(true);
    const Cities = { name: cityName };
    try {
      const response = await fetch('http://localhost:4000/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(Cities),
      });
      const result = await response.text();

      if (response.ok) {
        setMessage('تم إضافة المدينة بنجاح!');
        setCityName(''); // إعادة تعيين قيمة المدينة بعد الإضافة
      } else {
        setMessage(result || 'حدث خطأ أثناء إضافة المدينة.');
      }
    } catch (error) {
      setMessage('حدث خطأ أثناء الاتصال بالخادم.');
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
      const selectedCity = cities.find((c) => c.city_id === parseInt(city)); // العثور على المدينة بناءً على city_id
      const cityName = selectedCity ? selectedCity.name : ''; // الحصول على اسم المدينة

      const response = await fetch('http://localhost:4000/regions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: region, city_name: cityName }), // إرسال اسم المنطقة واسم المدينة
      });

      const result = await response.text();

      if (response.ok) {
        setMessage('تم إضافة المنطقة بنجاح!');
        setRegion(''); // إعادة تعيين قيمة المنطقة بعد الإضافة
      } else {
        setMessage(result || 'حدث خطأ أثناء إضافة المنطقة.');
      }
    } catch (error) {
      console.error('خطأ أثناء الاتصال بالخادم:', error);
      setMessage('حدث خطأ أثناء الاتصال بالخادم.');
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
            onChange={(e) => setCityName(e.target.value)} // تحديث قيمة اسم المدينة
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
