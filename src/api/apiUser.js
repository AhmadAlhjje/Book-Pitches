import {BASE_URL} from './api'
import {jwtDecode} from 'jwt-decode';

// دالة جلب بينات المستخدم حسب ال id
export const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('لا يوجد رمز مصادقة، يرجى تسجيل الدخول.');
    }
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id;
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('فشل في جلب بيانات المستخدم.');
    }
    return response.json();
};
