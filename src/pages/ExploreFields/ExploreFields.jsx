import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Row, Col } from 'react-bootstrap';
import { fetchFields, fetchRegions, fetchCities , addField ,deleteField } from "../../api/api";

const ExploreFields = () => {
  const [fields, setFields] = useState([]); 
  const [regions, setRegions] = useState([]); 
  const [cities, setCities] = useState([]); 
  const [filteredRegions, setFilteredRegions] = useState([]); // تخزين المناطق المفلترة حسب المدينة
  const [showModal, setShowModal] = useState(false); // حالة عرض نافذة إضافة ملعب جديد
  const [showDeleteModal, setShowDeleteModal] = useState(false); // حالة عرض نافذة تأكيد الحذف
  const [showErrorModal, setShowErrorModal] = useState(false); // حالة عرض نافذة الخطأ
  const [fieldToDelete, setFieldToDelete] = useState(null); // تخزين الملعب الذي سيتم حذفه
  const [newField, setNewField] = useState({
    name: '',
    region_id: '',
    city_id: '',
    phone_number: '',
    details: '',
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('لم يتم العثور على الرمز. يرجى تسجيل الدخول.');
      return;
    }

    Promise.all([
      fetchFields(),
      fetchRegions(),
      fetchCities(),
    ])
      .then(([fieldsData, regionsData, citiesData]) => {
        setFields(fieldsData);
        setRegions(regionsData);
        setCities(citiesData);
      })
      .catch((error) => {
        console.error('خطأ أثناء جلب البيانات:', error);
        setShowErrorModal(true); 
      });
  }, []);

  // التعامل مع تغيير المدخلات في نموذج إضافة الملعب
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewField((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'city_id' ? { region_id: '' } : {}), // إعادة تعيين المنطقة عند تغيير المدينة
    }));

    // تصفية المناطق بناءً على المدينة المحددة
    // هل هذا يدب ان يكون في الباك؟؟؟؟؟
    if (name === 'city_id' && value) {
      const cityId = parseInt(value);
      const cityRegions = regions.filter((region) => region.city_id === cityId);
      setFilteredRegions(cityRegions);
    }
  };

  // التعامل مع تغيير الصور في نموذج إضافة الملعب
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setNewField((prev) => ({
      ...prev,
      [name]: files[0],  // فقط أخذ أول صورة
    }));
  };

  // إضافة ملعب جديد إلى النظام
  const handleAddField = async (e) => {
    e.preventDefault(); // منع التحديث التلقائي للصفحة
    try {
      await addField(newField);
      window.location.reload();
    } catch (error) {
      setShowErrorModal(true); // عرض نافذة الخطأ في حالة الفشل
    }
  };
  

  // حذف الملعب من النظام
const handleDeleteField = async (field_id) => {
  try {
    const success = await deleteField(field_id);
    if (success) {
      setFields((prevFields) => prevFields.filter((field) => field.field_id !== field_id));
    }
  } catch (error) {
    console.error("خطأ أثناء حذف الملعب:", error);
  }
};


  // تأكيد حذف الملعب
  const confirmDeleteField = () => {
    if (fieldToDelete) {
      handleDeleteField(fieldToDelete);
      setShowDeleteModal(false);
    }
  };

  // الحصول على اسم المنطقة بناءً على معرف المنطقة
  // هل هذا افضل اذا استخدمنا الباك؟؟؟ ام هكذا اسرع لكي لا يحمل مرتين
  const getRegionName = (region_id) => {
    const region = regions.find((region) => region.region_id === region_id);
    return region ? region.name : '';
  };

  // الحصول على اسم المدينة بناءً على معرف المنطقة
  // هل هذا افضل اذا استخدمنا الباك؟؟؟ ام هكذا اسرع لكي لا يحمل مرتين
  const getCityNameByRegion = (region_id) => {
    const region = regions.find((region) => region.region_id === region_id);
    if (region) {
      const city = cities.find((city) => city.city_id === region.city_id);
      return city ? city.name : '';
    }
    return '';
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">لوحة تحكم المدير</h2>
      <h4 className="mb-4">جميع الملاعب</h4>

      <Table striped bordered hover variant="dark" responsive="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>اسم الملعب</th>
            <th>المنطقة</th>
            <th>المدينة</th>
            <th>رقم الهاتف</th>
            <th>التفاصيل</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.field_id}>
              <td>{field.field_id}</td>
              <td>{field.name}</td>
              <td>{getRegionName(field.region_id)}</td>
              <td>{getCityNameByRegion(field.region_id)}</td>
              {/* بدا باك */}
              <td>{field.phone_number}</td>
              <td>{field.details}</td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => {
                    setFieldToDelete(field.field_id);
                    setShowDeleteModal(true);
                  }}
                >
                  حذف
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button variant="success" onClick={() => setShowModal(true)} className="mb-4 w-100">
        إضافة ملعب جديد
      </Button>

      {/* نافذة التأكيد للحذف */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} size="sm">
        <Modal.Header closeButton>
          <Modal.Title>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>هل أنت متأكد من أنك تريد حذف هذا الملعب؟</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={confirmDeleteField}>
            تأكيد الحذف
          </Button>
        </Modal.Footer>
      </Modal>

      {/* نافذة الخطأ */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} size="sm">
        <Modal.Header closeButton>
          <Modal.Title>
            <span style={{ color: '#dc3545' }}>❗</span> خطأ
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              color: '#721c24', // اللون الأحمر
              backgroundColor: '#f8d7da', // خلفية فاتحة للخطأ
              padding: '15px',
              borderRadius: '8px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '20px' }}>❌</span>
            <span>الشخص غير موجود أو حدث خطأ في الخادم</span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowErrorModal(false)}>
            إغلاق
          </Button>
        </Modal.Footer>
      </Modal>

      {/* نافذة إضافة ملعب جديد */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>إضافة ملعب جديد</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>اسم الملعب</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newField.name}
                onChange={handleInputChange}
                placeholder="أدخل اسم الملعب"
              />
            </Form.Group>
            <Row>
              <Col xs={12} sm={6} className="mb-3">
                <Form.Label>المدينة</Form.Label>
                <Form.Select name="city_id" value={newField.city_id} onChange={handleInputChange}>
                  <option value="">اختر المدينة</option>
                  {cities.map((city) => (
                    <option key={city.city_id} value={city.city_id}>
                      {city.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} sm={6} className="mb-3">
                <Form.Label>المنطقة</Form.Label>
                <Form.Select
                  name="region_id"
                  value={newField.region_id}
                  onChange={handleInputChange}
                  disabled={!newField.city_id}
                >
                  <option value="">اختر المنطقة</option>
                  {filteredRegions.map((region) => (
                    <option key={region.region_id} value={region.region_id}>
                      {region.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>رقم الهاتف</Form.Label>
              <Form.Control
                type="text"
                name="phone_number"
                value={newField.phone_number}
                onChange={handleInputChange}
                placeholder="أدخل رقم الهاتف"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>التفاصيل</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="details"
                value={newField.details}
                onChange={handleInputChange}
                placeholder="أدخل التفاصيل"
              />
            </Form.Group>

            {/* إدخال الصور */}
            {['image1', 'image2', 'image3', 'image4'].map((imageField) => (
              <Form.Group key={imageField} className="mb-3">
                <Form.Label>الصورة {imageField.charAt(imageField.length - 1)}</Form.Label>
                <Form.Control
                  type="file"
                  name={imageField}
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            إغلاق
          </Button>
          <Button variant="primary" onClick={handleAddField}>
            حفظ
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ExploreFields;
