import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';

const ManageUsers = () => {
  const [users, setUsers] = useState([]); // لتخزين قائمة المستخدمين
  const [loading, setLoading] = useState(true); // لإظهار حالة التحميل
  const [error, setError] = useState(''); // لتخزين الأخطاء
  const token = localStorage.getItem('token'); // أخذ التوكن تلقائيًا من localStorage

  // استرداد المستخدمين من الخادم (API)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:4000/users/', {
          headers: {
            Authorization: `Bearer ${token}`, // إضافة التوكن في الهيدر
          },
        });

        if (!response.ok) {
          throw new Error('فشل في جلب بيانات المستخدمين');
        }

        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // ترقية المستخدم إلى Field Owner
  const handlePromote = async (userId) => {
    try {
      const url = `http://localhost:4000/users/${userId}/upgrade-to-field-owner`; // URL مع userId
      const response = await fetch(url, {
        method: 'PATCH', // تغيير الطريقة إلى PATCH
        headers: {
          Authorization: `Bearer ${token}`, // إضافة التوكن في الهيدر
        },
      });

      if (response.ok) {
        alert('تمت ترقية المستخدم إلى صاحب ملعب!');
        setUsers(users.map((user) => (user.user_id === userId ? { ...user, user_type: 'field_owner' } : user)));
      } else {
        alert('حدث خطأ أثناء الترقية.');
      }
    } catch (error) {
      console.error('خطأ أثناء الترقية:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h3 className="mb-4">إدارة المستخدمين</h3>
      {users.length === 0 ? (
        <Alert variant="info">لا يوجد مستخدمون حاليًا.</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>رقم الهاتف</th> {/* استبدال البريد الإلكتروني برقم الهاتف */}
              <th>الدور الحالي</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.name}</td>
                <td>{user.phone_number}</td> {/* عرض رقم الهاتف */}
                <td>{user.user_type}</td>
                <td>
                  {user.user_type !== 'field_owner' && (
                    <Button variant="success" onClick={() => handlePromote(user.user_id)}>
                      ترقية إلى صاحب ملعب
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ManageUsers;
