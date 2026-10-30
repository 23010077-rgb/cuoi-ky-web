import axios from 'axios';

// withCredentials: trình duyệt tự gắn cookie httpOnly chứa JWT.
// Frontend KHÔNG đọc, KHÔNG lưu token (không dùng localStorage/sessionStorage).
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  timeout: 10000,
});

/** Chuyển lỗi API thành thông báo thân thiện, không lộ chi tiết kỹ thuật. */
export function errorMessage(err) {
  const m = err?.response?.data?.message;
  if (Array.isArray(m)) return m.join('. ');
  if (typeof m === 'string' && err.response.status < 500) return m;
  if (!err?.response) return 'Không thể kết nối máy chủ. Vui lòng thử lại.';
  return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
}

export default http;
