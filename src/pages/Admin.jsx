import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Col, Container, Form, Row, Tab, Table, Tabs } from 'react-bootstrap';
import http, { errorMessage } from '../api/http';
import { vnd } from '../api/format';

const EMPTY_HOTEL = { name: '', city: '', address: '', stars: 3, imageUrl: '', description: '' };
const EMPTY_ROOM = { name: '', pricePerNight: 500000, capacity: 2, quantity: 1 };

function HotelsTab({ onError }) {
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState(EMPTY_HOTEL);
  const [roomForm, setRoomForm] = useState({});

  const load = () => http.get('/hotels').then((r) => setHotels(r.data)).catch((e) => onError(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const createHotel = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, stars: Number(form.stars) };
      if (!body.imageUrl) delete body.imageUrl;
      await http.post('/hotels', body);
      setForm(EMPTY_HOTEL);
      onError('');
      load();
    } catch (err) { onError(errorMessage(err)); }
  };

  const removeHotel = async (id) => {
    if (!window.confirm('Xoá khách sạn này cùng toàn bộ phòng và đơn liên quan?')) return;
    try { await http.delete(`/hotels/${id}`); load(); } catch (err) { onError(errorMessage(err)); }
  };

  const addRoom = async (hotelId) => {
    try {
      const f = { ...EMPTY_ROOM, ...(roomForm[hotelId] || {}) };
      await http.post(`/hotels/${hotelId}/rooms`, {
        name: f.name, pricePerNight: Number(f.pricePerNight), capacity: Number(f.capacity), quantity: Number(f.quantity),
      });
      setRoomForm({ ...roomForm, [hotelId]: undefined });
      onError('');
      load();
    } catch (err) { onError(errorMessage(err)); }
  };

  const removeRoom = async (roomId) => {
    try { await http.delete(`/hotels/rooms/${roomId}`); load(); } catch (err) { onError(errorMessage(err)); }
  };

  const setRoom = (hid, k, v) => setRoomForm({ ...roomForm, [hid]: { ...EMPTY_ROOM, ...(roomForm[hid] || {}), [k]: v } });

  return (
    <>
      <Form onSubmit={createHotel} className="bg-white border rounded p-3 mb-4">
        <h2 className="h6">Thêm khách sạn</h2>
        <Row className="g-2">
          <Col md={4}><Form.Control placeholder="Tên" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Col>
          <Col md={3}><Form.Control placeholder="Thành phố" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Col>
          <Col md={5}><Form.Control placeholder="Địa chỉ" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Col>
          <Col md={2}><Form.Select value={form.stars} onChange={(e) => setForm({ ...form, stars: e.target.value })}>{[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s} sao</option>)}</Form.Select></Col>
          <Col md={6}><Form.Control placeholder="URL ảnh (https://…)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></Col>
          <Col md={4}><Form.Control placeholder="Mô tả ngắn" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Col>
        </Row>
        <Button type="submit" className="btn-bk mt-2" size="sm">Thêm</Button>
      </Form>

      {hotels.map((h) => (
        <div key={h.id} className="bg-white border rounded p-3 mb-3">
          <div className="d-flex justify-content-between">
            <div><strong>{h.name}</strong> <span className="text-muted">– {h.city} · {h.stars}★</span></div>
            <Button size="sm" variant="outline-danger" onClick={() => removeHotel(h.id)}>Xoá</Button>
          </div>
          <Table size="sm" className="mt-2 mb-2">
            <thead><tr><th>Phòng</th><th>Giá</th><th>Sức chứa</th><th>Số phòng</th><th /></tr></thead>
            <tbody>
              {h.rooms.map((r) => (
                <tr key={r.id}><td>{r.name}</td><td>{vnd(r.pricePerNight)}</td><td>{r.capacity}</td><td>{r.quantity}</td>
                  <td><Button size="sm" variant="link" className="text-danger p-0" onClick={() => removeRoom(r.id)}>Xoá</Button></td></tr>
              ))}
            </tbody>
          </Table>
          <Row className="g-2">
            <Col md={4}><Form.Control size="sm" placeholder="Tên phòng" value={roomForm[h.id]?.name ?? ''} onChange={(e) => setRoom(h.id, 'name', e.target.value)} /></Col>
            <Col md={3}><Form.Control size="sm" type="number" min={1} placeholder="Giá/đêm" value={roomForm[h.id]?.pricePerNight ?? 500000} onChange={(e) => setRoom(h.id, 'pricePerNight', e.target.value)} /></Col>
            <Col md={2}><Form.Control size="sm" type="number" min={1} max={20} value={roomForm[h.id]?.capacity ?? 2} onChange={(e) => setRoom(h.id, 'capacity', e.target.value)} /></Col>
            <Col md={2}><Form.Control size="sm" type="number" min={1} value={roomForm[h.id]?.quantity ?? 1} onChange={(e) => setRoom(h.id, 'quantity', e.target.value)} /></Col>
            <Col md={1}><Button size="sm" className="btn-bk w-100" onClick={() => addRoom(h.id)}>+</Button></Col>
          </Row>
        </div>
      ))}
    </>
  );
}

function BookingsTab({ onError }) {
  const [items, setItems] = useState([]);
  const load = () => http.get('/bookings').then((r) => setItems(r.data)).catch((e) => onError(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try { await http.patch(`/bookings/${id}/status`, { status }); load(); } catch (e) { onError(errorMessage(e)); }
  };

  return (
    <Table responsive bordered className="bg-white align-middle">
      <thead><tr><th>#</th><th>Khách</th><th>Khách sạn / Phòng</th><th>Nhận – Trả</th><th>Tổng</th><th>Trạng thái</th></tr></thead>
      <tbody>
        {items.map((b) => (
          <tr key={b.id}>
            <td>{b.id}</td>
            <td>{b.user?.fullName}<div className="small text-muted">{b.user?.email}</div></td>
            <td>{b.room?.hotel?.name}<div className="small text-muted">{b.room?.name}</div></td>
            <td>{b.checkIn} → {b.checkOut}</td>
            <td>{vnd(b.totalPrice)}</td>
            <td>
              <Form.Select size="sm" value={b.status} onChange={(e) => setStatus(b.id, e.target.value)}>
                <option value="confirmed">Đã xác nhận</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã huỷ</option>
              </Form.Select>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default function Admin() {
  const [error, setError] = useState('');
  return (
    <Container className="py-4">
      <h1 className="h4 mb-3">Quản trị <Badge bg="dark" className="fs-6">Admin</Badge></h1>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      <Tabs defaultActiveKey="hotels" className="mb-3">
        <Tab eventKey="hotels" title="Khách sạn & phòng"><HotelsTab onError={setError} /></Tab>
        <Tab eventKey="bookings" title="Đơn đặt phòng"><BookingsTab onError={setError} /></Tab>
      </Tabs>
    </Container>
  );
}
