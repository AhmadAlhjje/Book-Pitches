import React, { useState } from 'react';
import { Container, Nav, Button } from 'react-bootstrap';
import ExploreFields from '../ExploreFields/ExploreFields'; // صفحة مدير الملاعب
import ManageUsers from '../ManageUsers/ManageUsers'; // صفحة إدارة المستخدمين
import AddCityRegion from '../AddCityRegion/AddCityRegion'; // صفحة إضافة المدينة والمنطقة

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('manager'); // لتحديد الصفحة الافتراضية
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // حالة الشريط الجانبي

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false); // إغلاق الشريط الجانبي على الشاشات الصغيرة
  };

  const toggleSidebar = () => setIsSidebarOpen(prevState => !prevState); // تغيير حالة الشريط الجانبي

  const sidebarStyle = {
    width: '200px',
    backgroundColor: '#343a40',
    minHeight: '100vh',
    color: 'white',
    padding: '20px',
    position: 'fixed',
    top: 0,
    right: 0,
    zIndex: 1040,
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  };

  const contentStyle = {
    marginRight: isSidebarOpen ? '250px' : '0', // مسافة بجانب الشريط
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    transition: 'margin-right 0.3s',
    overflowX: 'auto', // التمرير الأفقي إذا كان الجدول عريضاً
  };

  return (
    <Container fluid className="p-0 d-flex">
      {/* زر التحكم في الشريط الجانبي للشاشات الصغيرة */}
      <Button
        className="d-md-none position-fixed"
        onClick={toggleSidebar}
        style={{
          top: '10px',
          right: '10px',
          zIndex: 1050,
          backgroundColor: '#343a40',
          borderColor: '#343a40',
          color: 'white',
        }}
      >
        ☰
      </Button>

      {/* الشريط الجانبي */}
      <div
        className={`d-md-block ${isSidebarOpen ? 'd-block' : 'd-none'}`}
        style={sidebarStyle}
      >
        <h4 className="mb-4 text-center">لوحة التحكم</h4>
        <Nav className="flex-column">
          {['manager', 'users', 'cityRegion'].map((page, index) => (
            <Nav.Link
              key={index}
              onClick={() => handlePageChange(page)}
              className={`text-white mb-3 ${currentPage === page ? 'bg-primary p-2 rounded' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              {page === 'manager' && 'مدير الملاعب'}
              {page === 'users' && 'إدارة المستخدمين'}
              {page === 'cityRegion' && 'إضافة مدينة ومنطقة'}
            </Nav.Link>
          ))}
        </Nav>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="content p-4" style={contentStyle}>
        {currentPage === 'manager' && <ExploreFields />}
        {currentPage === 'users' && <ManageUsers />}
        {currentPage === 'cityRegion' && <AddCityRegion />}
      </div>
    </Container>
  );
};

export default Dashboard;
