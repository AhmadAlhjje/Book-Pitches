import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ phone_number: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const { phone_number, password } = credentials;

    if (!phone_number || !password) {
      setErrorMessage('يرجى ملء جميع الحقول.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ أثناء تسجيل الدخول.');
      }

      // تخزين التوكن في localStorage
      localStorage.setItem('token', data.token);

      // استخراج الـ id من التوكن
      const decodedToken = jwtDecode(data.token);
      const userId = decodedToken.id;

      // إرسال طلب للتحقق من نوع المستخدم
      const userResponse = await fetch(`http://localhost:4000/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
        },
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.message || 'فشل في التحقق من بيانات المستخدم.');
      }

      // التحقق من نوع المستخدم
      if (userData.user_type === 'field_owner') {
        alert('تم تسجيل الدخول بنجاح! يتم تحويلك إلى صفحة الإدارة.');
        navigate('/admin'); 
      } else if (userData.user_type === 'site_owner') {
        alert('تم تسجيل الدخول بنجاح! يتم تحويلك إلى لوحة التحكم.');
        navigate('/dashboard'); 
      } else {
        alert('تم تسجيل الدخول بنجاح!');
        navigate('/');
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <Container fluid className="login-container">
      <div className="login-box">
        <h2 className="text-center text-white">تسجيل الدخول</h2>

        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="text-white">رقم الهاتف</Form.Label>
            <Form.Control
              type="text"
              placeholder="أدخل رقم هاتفك..."
              name="phone_number"
              value={credentials.phone_number}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-white">كلمة المرور</Form.Label>
            <Form.Control
              type="password"
              placeholder="أدخل كلمة المرور..."
              name="password"
              value={credentials.password}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="success" className="w-100" onClick={handleLogin}>
            تسجيل الدخول
          </Button>
        </Form>

        <p className="text-white mt-3 text-center">
          ليس لديك حساب؟{' '}
          <span
            className="text-primary"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/register')}
          >
            سجل الآن
          </span>
        </p>
      </div>
    </Container>
  );
};

export default Login;
