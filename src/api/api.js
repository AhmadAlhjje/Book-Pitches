export const BASE_URL = "http://localhost:4000";



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


//  دالة جلب جميع المناطق
export const fetchRegions = async () => {
  const response = await fetch(`${BASE_URL}/regions`);
  if (!response.ok) throw new Error("فشل في جلب بيانات المناطق");
  return response.json();
};

//  دالة جلب جميع المدن
export const fetchCities = async () => {
  const response = await fetch(`${BASE_URL}/cities`);
  if (!response.ok) throw new Error("فشل في جلب بيانات المدن");
  return response.json();
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
