import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
// import bcrypt from 'bcryptjs'; // استيراد مكتبة التشفير
import { registerUser } from '../../api/apiRegister'; // استيراد دالة registerUser من ملف الـ API
import './Register.css';

const Register = () => {
  const navigate = useNavigate(); // تابع يستخدم للتنقل بين الصفحات
  const [formData, setFormData] = useState({
    name: '', 
    phone_number: '', 
    password: '', 
    confirmPassword: '', 
  });
  const [errorMessage, setErrorMessage] = useState(''); // رسالة الخطأ عند وجود مشكلة
  const [successMessage, setSuccessMessage] = useState(''); // رسالة النجاح عند إتمام التسجيل

  // تابع لتحديث بيانات النموذج عند تغيير المدخلات
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // تابع للتحقق من صحة رقم الهاتف (يجب أن يحتوي على 10-8 رقماً)
  const validatephone_number = (phone_number) => {
    const regex = /^[0-9]{8,10}$/; 
    return regex.test(phone_number); // يعيد true إذا كان الرقم صحيحًا، وfalse إذا لم يكن كذلك
  };

  // تابع للتعامل مع عملية التسجيل
  const handleRegister = async () => {
    const { name, phone_number, password, confirmPassword } = formData;
  
    if (!name || !phone_number || !password || !confirmPassword) {
      setErrorMessage('يرجى ملء جميع الحقول.');
      return;
    }
  
    if (!validatephone_number(phone_number)) {
      setErrorMessage('يرجى إدخال رقم هاتف صالح يحتوي على 10-8 ارقام.');
      return;
    }
  
    if (password.length < 6) {
      setErrorMessage('يجب أن تكون كلمة المرور 6 أحرف على الأقل.');
      return;
    }
  
    if (password !== confirmPassword) {
      setErrorMessage('كلمات المرور غير متطابقة!');
      return;
    }
  
    try {
      // استخدم دالة registerUser بدلاً من fetch
      const data = await registerUser(name, phone_number, password);
  
      if (data === "User registered") {
        setSuccessMessage('تم التسجيل بنجاح! سيتم توجيهك إلى صفحة تسجيل الدخول.');
        setErrorMessage('');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setErrorMessage(data || 'حدث خطأ غير معروف');
      }
    } catch (error) {
      setErrorMessage('حدث خطأ أثناء الاتصال بالخادم.');
      console.error(error);
    }
  };
  
  

  return (
    <Container fluid className="register-container">
      <div className="register-box">
        <h2 className="text-center text-white">التسجيل</h2>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="text-white">الاسم</Form.Label>
            <Form.Control
              type="text"
              placeholder="أدخل اسمك..."
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-white">رقم الهاتف</Form.Label>
            <Form.Control
              type="text"
              placeholder="أدخل رقمك..."
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-white">كلمة المرور</Form.Label>
            <Form.Control
              type="password"
              placeholder="أدخل كلمة المرور..."
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-white">تأكيد كلمة المرور</Form.Label>
            <Form.Control
              type="password"
              placeholder="أعد إدخال كلمة المرور..."
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </Form.Group>
          <Button variant="success" className="w-100" onClick={handleRegister}>
            تسجيل
          </Button>
        </Form>
        <p className="text-white mt-3 text-center">
          لديك حساب بالفعل؟{' '}
          <span
            className="text-primary"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            تسجيل الدخول
          </span>
        </p>
      </div>
    </Container>
  );
};

export default Register;
