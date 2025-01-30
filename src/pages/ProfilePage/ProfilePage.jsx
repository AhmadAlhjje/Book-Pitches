import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import UserProfile from '../../components/UserProfile/UserProfile';
import { jwtDecode } from 'jwt-decode'; // لاستيراد مكتبة فك التوكن
import './ProfilePage.css'; // ملف التنسيق

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState(''); // حالة لتخزين رقم الهاتف
  const [isEditing, setIsEditing] = useState(false); // حالة لتحديد وضع التعديل
  const [error, setError] = useState(''); // حالة للأخطاء
  const [successMessage, setSuccessMessage] = useState(''); // حالة للرسائل الناجحة

  // تحميل بيانات المستخدم عند تحميل الصفحة
  useEffect(() => {
    const token = localStorage.getItem('token'); // الحصول على التوكن من التخزين المحلي
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // فك التوكن
        const userId = decodedToken.id; // استخراج الـ id
        const userPhone = decodedToken.phone_number; // استخراج رقم الهاتف من التوكن
        setPhone(userPhone); // تخزين رقم الهاتف في الحالة

        // جلب بيانات المستخدم من الخادم
        fetch(`http://localhost:4000/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // إرسال التوكن في الهيدر
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('فشل في جلب بيانات المستخدم.');
            }
            return response.json();
          })
          .then((data) => {
            setUser(data); // تعيين بيانات المستخدم في الحالة
          })
          .catch((error) => {
            setError('حدث خطأ في جلب بيانات المستخدم.');
            console.error(error);
          });
      } catch (err) {
        setError('خطأ في فك التوكن');
        console.error('خطأ في فك التوكن:', err.message);
      }
    } else {
      setError('التوكن غير موجود. يرجى تسجيل الدخول');
    }
  }, []);

  const handleSaveChanges = async () => {
    if (user && phone !== user.phone_number) {
      try {
        const token = localStorage.getItem('token');
        const userId = jwtDecode(token).id;

        // إرسال التحديثات إلى الخادم
        const response = await fetch(`http://localhost:4000/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ phone_number: phone }), // إرسال البيانات المعدلة
        });

        if (!response.ok) {
          throw new Error('فشل في حفظ التغييرات');
        }

        const data = await response.json();
        setUser(data); // تحديث البيانات في الحالة
        setSuccessMessage('تم حفظ التغييرات بنجاح!');
        setIsEditing(false); // إيقاف وضع التعديل
      } catch (error) {
        setError('حدث خطأ أثناء حفظ التغييرات.');
      }
    }
  };

  return (
    <Container className="profile-page mt-4 text-white" dir="rtl">
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* معلومات المستخدم */}
      <Row>
        <Col md={12} className="mb-4">
          <UserProfile
            user={user}
            setUser={setUser}
            phone={phone} // تمرير رقم الهاتف إلى UserProfile
            setPhone={setPhone}
            isEditing={isEditing} // تمرير حالة التعديل
            setIsEditing={setIsEditing} // دالة تغيير حالة التعديل
          />
        </Col>
      </Row>

      {isEditing && (
        <Row>
          <Col md={12} className="text-center">
            <Button variant="primary" onClick={handleSaveChanges}>
              حفظ التغييرات
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ProfilePage;
