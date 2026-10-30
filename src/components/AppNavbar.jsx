import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Navbar expand="md" variant="dark" className="bk-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">StayEasy</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-md-center gap-md-2">
            {user ? (
              <>
                {user.role === 'admin' && <Nav.Link as={Link} to="/admin">Quản trị</Nav.Link>}
                <Nav.Link as={Link} to="/bookings">Đơn của tôi</Nav.Link>
                <span className="navbar-text text-white-50 d-none d-lg-inline">{user.fullName}</span>
                <Button variant="outline-light" size="sm" onClick={onLogout}>Đăng xuất</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/register" variant="light" size="sm">Đăng ký</Button>
                <Button as={Link} to="/login" variant="outline-light" size="sm">Đăng nhập</Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
