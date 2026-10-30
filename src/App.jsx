import { Link, Route, Routes } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import Admin from './pages/Admin';
import HotelDetail from './pages/HotelDetail';
import Home from './pages/Home';
import Login from './pages/Login';
import MyBookings from './pages/MyBookings';
import Register from './pages/Register';
import Search from './pages/Search';

function NotFound() {
  return (
    <div className="text-center py-5">
      <h1 className="h3">404 – Không tìm thấy trang</h1>
      <Link to="/">Về trang chủ</Link>
    </div>
  );
}

export default function App() {
  return (
    <>
      <AppNavbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/hotels/:id" element={<HotelDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="text-center text-muted small py-4">
        © 2026 StayEasy – Đồ án môn học, Đại học Phenikaa. MIT License.
      </footer>
    </>
  );
}
