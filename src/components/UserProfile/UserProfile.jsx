import React, { useState } from 'react'; // استيراد مكتبة React
import { Form, Button } from 'react-bootstrap'; // استيراد المكونات اللازمة من React-Bootstrap
import './UserProfile.css'; // استيراد ملف CSS لتنسيق المكون

// مكون UserProfile يعرض واجهة المستخدم لتحديث ملفه الشخصي
const UserProfile = ({ user, setUser, phone, setPhone, isEditing, setIsEditing }) => {
  // تحديث الحقول النصية عند إدخال القيم
  const handleChange = (e) => {
    const { name, value } = e.target; // جلب الاسم والقيمة من العنصر
    setUser((prevUser) => ({ ...prevUser, [name]: value })); // تحديث حالة المستخدم
  };

  // معالجة حفظ التعديلات
  const handleSave = () => {
    setIsEditing(false); // إيقاف وضع التعديل
    // هنا يمكن إضافة منطق لحفظ التعديلات في قاعدة البيانات
    // على سبيل المثال:
    // fetch('http://your-api-url', { method: 'POST', body: JSON.stringify(user) })
    //   .then(response => response.json())
    //   .then(data => {
    //     setUser(data);
    //   });
  };

  return (
    <div className="text-center">
      {/* عرض الحقول بناءً على حالة التعديل */}
      {isEditing ? (
        <>
          {/* نموذج تعديل البيانات */}
          <Form.Group className="mb-3">
            <Form.Label>الاسم</Form.Label>
            <Form.Control type="text" name="name" value={user?.name} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>رقم الهاتف</Form.Label>
            <Form.Control type="text" name="phone" value={user?.phone} onChange={handleChange} />
          </Form.Group>
          {/* زر لحفظ التعديلات */}
          <Button variant="success" onClick={handleSave}>
            حفظ التعديلات
          </Button>
        </>
      ) : (
        <>
          {/* عرض البيانات إذا لم يكن المستخدم في وضع التعديل */}
          <p><strong>الاسم:</strong> {user?.name}</p>
          <p><strong>رقم الهاتف:</strong> {phone || user?.phone}</p>
          {/* زر لتفعيل وضع التعديل */}
          <Button variant="primary" onClick={() => setIsEditing(true)}>تعديل الملف الشخصي</Button>
        </>
      )}
    </div>
  );
};

export default UserProfile;
