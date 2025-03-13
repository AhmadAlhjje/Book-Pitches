import React, { useState } from 'react';
import { Container, Nav, Button } from 'react-bootstrap';
import ExploreFields from '../ExploreFields/ExploreFields';
import ManageUsers from '../ManageUsers/ManageUsers'; 
import AddCityRegion from '../AddCityRegion/AddCityRegion';
import './Dashboard.css'; 

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('manager'); // لتحديد الصفحة الافتراضية
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // حالة الشريط الجانبي

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false); // إغلاق الشريط الجانبي على الشاشات الصغيرة
  };

  const toggleSidebar = () => setIsSidebarOpen(prevState => !prevState); // تغيير حالة الشريط الجانبي

  return (
    <Container fluid className="dashboard-container">
      {/* زر التحكم في الشريط الجانبي للشاشات الصغيرة */}
      <Button className="sidebar-toggle-btn d-md-none" onClick={toggleSidebar}>
        ☰
      </Button>

      {/* الشريط الجانبي */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h4 className="sidebar-title">لوحة التحكم</h4>
        <Nav className="flex-column">
          {['manager', 'users', 'cityRegion'].map((page, index) => (
            <Nav.Link
              key={index}
              onClick={() => handlePageChange(page)}
              className={`sidebar-link ${currentPage === page ? 'active' : ''}`}
            >
              {page === 'manager' && 'مدير الملاعب'}
              {page === 'users' && 'إدارة المستخدمين'}
              {page === 'cityRegion' && 'إضافة مدينة ومنطقة'}
            </Nav.Link>
          ))}
        </Nav>
      </div>

      {/* المحتوى الرئيسي */}
      <div className={`content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {currentPage === 'manager' && <ExploreFields />}
        {currentPage === 'users' && <ManageUsers />}
        {currentPage === 'cityRegion' && <AddCityRegion />}
      </div>
    </Container>
  );
};

export default Dashboard;
