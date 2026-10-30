import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Container, Spinner, Table } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import http, { errorMessage } from '../api/http';
import { vnd } from '../api/format';

const STATUS = {
  confirmed: { bg: 'success', text: 'Đã xác nhận' },
  cancelled: { bg: 'secondary', text: 'Đã huỷ' },
  completed: { bg: 'primary', text: 'Hoàn thành' },
};

export default function MyBookings() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    http.get('/bookings/mine')
      .then((r) => setItems(r.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn huỷ đơn này?')) return;
    setError('');
    try {
      await http.patch(`/bookings/${id}/cancel`);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <Container className="py-4">
      <h1 className="h4 mb-3">Đơn đặt phòng của tôi</h1>
      {location.state?.success && <Alert variant="success">Đặt phòng thành công!</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
        items.length === 0 ? <Alert variant="info">Bạn chưa có đơn đặt phòng nào.</Alert> : (
          <Table responsive bordered hover className="bg-white align-middle">
            <thead><tr><th>#</th><th>Khách sạn</th><th>Phòng</th><th>Nhận – Trả</th><th>Khách</th><th>Tổng</th><th>Trạng thái</th><th /></tr></thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.room?.hotel?.name}</td>
                  <td>{b.room?.name}</td>
                  <td>{b.checkIn} → {b.checkOut}</td>
                  <td>{b.guests}</td>
                  <td>{vnd(b.totalPrice)}</td>
                  <td><Badge bg={STATUS[b.status]?.bg}>{STATUS[b.status]?.text ?? b.status}</Badge></td>
                  <td>{b.status === 'confirmed' && <Button size="sm" variant="outline-danger" onClick={() => cancel(b.id)}>Huỷ</Button>}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      )}
    </Container>
  );
}
