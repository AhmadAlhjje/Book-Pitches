import {BASE_URL} from './api'

//  دالة جلب جميع الملاعب
export const fetchFields = async () => {
    const response = await fetch(`${BASE_URL}/fields`);
    if (!response.ok) throw new Error("فشل في جلب بيانات الملاعب");
    return response.json();
  };
  
  // دالة اضافة ملعب 
  export const addField = async (newField) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("لم يتم العثور على الرمز. يرجى تسجيل الدخول.");
      return;
    }
    const formData = new FormData();
    formData.append("name", newField.name);
    formData.append("region_id", newField.region_id);
    formData.append("details", newField.details);
    formData.append("city_id", newField.city_id);
    formData.append("phone_number", newField.phone_number);
    // إضافة الصور إذا كانت موجودة
    if (newField.image1) formData.append("image1", newField.image1);
    if (newField.image2) formData.append("image2", newField.image2);
    if (newField.image3) formData.append("image3", newField.image3);
    if (newField.image4) formData.append("image4", newField.image4);
    try {
      const response = await fetch(`${BASE_URL}/fields`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("فشل في إضافة الملعب");
      }
      return await response.json();
    } catch (error) {
      console.error("خطأ:", error);
      throw error;
    }
  };

  // دالة حذف ملعب
  export const deleteField = async (field_id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("لم يتم العثور على الرمز. يرجى تسجيل الدخول.");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/fields/${field_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("فشل في حذف الملعب");
      }
      return true; // نجاح الحذف
    } catch (error) {
      console.error("خطأ أثناء حذف الملعب:", error);
      throw error;
    }
  };

  //  دالة البحث عن الملاعب
export const searchFields = async (filters) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
      field_name: filters.name || "",
      city_name: filters.city || "",
      region_name: filters.region || "",
    });
  
    const response = await fetch(`${BASE_URL}/fields/search?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  
    if (response.status === 404) return [];
    if (!response.ok) throw new Error("فشل في البحث عن الملاعب");
    
    return response.json();
  };




// دالة جلب id الملعب التابع للمستخدم من خلال id المستخدم
export const fetchFieldByUser = async (userId, token) => {
  const response = await fetch(`${BASE_URL}/field_owners/field_by_user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("فشل في جلب بيانات الملعب الخاص بالمستخدم");
  return response.json();
};

// دالة جلب بيانات الملعب المحدد
export const fetchFieldById = async (fieldId) => {
  const response = await fetch(`${BASE_URL}/fields/${fieldId}`);
  if (!response.ok) throw new Error("فشل في جلب بيانات الملعب");
  return response.json();
};


// دالة لتعديل تفاصيل الملعب عبر API
export const editFieldDetails = async (fieldId, fieldDetails, token) => {
  try {
    // تجهيز البيانات باستخدام FormData لإرسال الصور والبيانات النصية
    const formData = new FormData();
    formData.append('name', fieldDetails.name);
    formData.append('details', fieldDetails.description);
    
    // إضافة الصور إلى FormData إذا كانت موجودة
    fieldDetails.images.forEach((image, index) => {
      if (image) {
        formData.append(`image${index + 1}`, image);
      }
    });

    // إرسال الطلب إلى API لتحديث بيانات الملعب
    const response = await fetch(`http://localhost:4000/fields/${fieldId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }, // إرسال التوكن فقط بدون Content-Type عند استخدام FormData
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData.message || 'فشل في حفظ التعديلات.');
    }

    return true; // إرجاع قيمة تدل على النجاح
  } catch (error) {
    throw error;
  }
};
