import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthContext } from '../context/AuthContext';

const renderAt = (auth, role) =>
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/" element={<div>TRANG CHỦ</div>} />
          <Route path="/login" element={<div>TRANG ĐĂNG NHẬP</div>} />
          <Route path="/private" element={<ProtectedRoute role={role}><div>NỘI DUNG RIÊNG</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe('ProtectedRoute', () => {
  it('chưa đăng nhập -> chuyển tới /login', () => {
    renderAt({ user: null, loading: false });
    expect(screen.getByText('TRANG ĐĂNG NHẬP')).toBeInTheDocument();
  });
  it('đã đăng nhập -> thấy nội dung', () => {
    renderAt({ user: { role: 'user' }, loading: false });
    expect(screen.getByText('NỘI DUNG RIÊNG')).toBeInTheDocument();
  });
  it('sai vai trò -> về trang chủ', () => {
    renderAt({ user: { role: 'user' }, loading: false }, 'admin');
    expect(screen.getByText('TRANG CHỦ')).toBeInTheDocument();
  });
  it('đúng vai trò admin -> thấy nội dung', () => {
    renderAt({ user: { role: 'admin' }, loading: false }, 'admin');
    expect(screen.getByText('NỘI DUNG RIÊNG')).toBeInTheDocument();
  });
});
