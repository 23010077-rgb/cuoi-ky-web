import { useState } from 'react';
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/http';
import { useAuth } from '../context/AuthContext';

const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!STRONG.test(form.password)) {
      setError('Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và chữ số');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await register(form);
      await login(form.email, form.password); // đăng ký xong tự đăng nhập: bớt 1 bước cho người dùng
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 440 }}>
      <Card><Card.Body>
        <h1 className="h4 mb-3">Tạo tài khoản</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Label>Họ tên</Form.Label>
            <Form.Control required minLength={2} maxLength={100} value={form.fullName} onChange={set('fullName')} autoComplete="name" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control type="password" required value={form.password} onChange={set('password')} autoComplete="new-password" />
            <Form.Text muted>Tối thiểu 8 ký tự, có chữ hoa, chữ thường và chữ số.</Form.Text>
          </Form.Group>
          <Button type="submit" className="btn-bk w-100" disabled={busy}>{busy ? 'Đang tạo…' : 'Đăng ký'}</Button>
        </Form>
        <div className="mt-3 small">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></div>
      </Card.Body></Card>
    </Container>
  );
}
