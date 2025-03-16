import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchUserData } from '../../api/apiUser'; 
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('اسم المستخدم');
  const [userPhone, setUserPhone] = useState('رقم الهاتف');

  useEffect(() => {
    const fetchUser = async () => {
        try {
            const userData = await fetchUserData();
            setIsLoggedIn(true);
            setUserName(userData.name);
            setUserPhone(userData.phone_number);
        } catch (error) {
            console.error(error);
            setIsLoggedIn(false);
        }
    };
    fetchUser();
}, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // إزالة التوكن عند تسجيل الخروج
    setIsLoggedIn(false);
    navigate('/'); 
  };

  return (
    <Navbar className="custom-navbar text-white" expand="lg" dir="rtl">
      <Navbar.Brand className="ms-3 site-name">
        PENALTY <span className="small-text">KICK</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="me-auto">
          {isLoggedIn ? (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="text-white d-flex align-items-center no-underline"
                style={{ border: 'none', boxShadow: 'none', cursor: 'pointer' }}
              >
                <span className="ms-2" style={{ fontSize: '1.5rem' }}>{userName}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate('/profile')}>
                  الملف الشخصي
                </Dropdown.Item> 
                <Dropdown.Item onClick={() => navigate('/bookings')}>
                  الحجوزات
                </Dropdown.Item>
                <Dropdown.Item onClick={handleLogout}>تسجيل الخروج</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <>
              <Button
                variant="outline-light"
                className="mx-2"
                onClick={() => navigate('/login')}
              >
                تسجيل الدخول
              </Button>
              <Button
                variant="outline-success"
                onClick={() => navigate('/register')}
              >
                تسجيل جديد
              </Button>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
