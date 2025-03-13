import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './FieldCard.css';
import {BASE_URL} from '../../api/api'

const FieldCard = ({ field, regions, cities }) => {
  // البحث عن المنطقة والمدينة باستخدام معرفات المنطقة والمدينة
  const region = regions.find(region => region.region_id === field.region_id);
  const city = cities.find(city => city.city_id === region?.city_id);

  return (
    <Card className="field-card shadow-sm">
      <Card.Img 
        variant="top" 
        src={`${BASE_URL}/uploads/${field.image1.split('\\').pop()}`} 
        className="card-image" 
      />
      <Card.Body>
        <Card.Title>{field.name}</Card.Title>
        <Card.Text>
          المنطقة: {region ? region.name : 'غير محدد'} <br />
          المدينة: {city ? city.name : 'غير محدد'}
        </Card.Text>
        {/* رابط لعرض تفاصيل الملعب */}
        <Link to={`/field/${field.field_id}`} className="btn btn-primary">
          عرض التفاصيل
        </Link>
      </Card.Body>
    </Card>
  );
};

export default FieldCard;
