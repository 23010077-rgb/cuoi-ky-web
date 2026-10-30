import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import http, { errorMessage } from '../api/http';
import { addDays, nightsBetween, vnd } from '../api/format';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';

export default function HotelDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const checkIn = params.get('checkIn') ?? addDays(1);
  const checkOut = params.get('checkOut') ?? addDays(2);
  const guests = Number(params.get('guests')) || 2;
  const nights = nightsBetween(checkIn, checkOut);

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null); // phòng đang xác nhận
  const [submitting, setSubmitting] = useState(false);
  const [bookError, setBookError] = useState('');

  useEffect(() => {
    setLoading(true);
    http.get(`/hotels/${id}`, { params: { checkIn, checkOut } })
      .then((r) => setHotel(r.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [id, checkIn, checkOut]);

  const onBook = (room) => {
    if (!user) {
      navigate('/login', { state: { from: `/hotels/${id}?${params.toString()}` } });
      return;
    }
    setBookError('');
    setSelected(room);
  };

  const confirm = async () => {
    setSubmitting(true);
    setBookError('');
    try {
      await http.post('/bookings', { roomId: selected.id, checkIn, checkOut, guests });
      setSelected(null);
      navigate('/bookings', { state: { success: true } });
    } catch (e) {
      setBookError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (error) return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-4">
      <Row className="g-3">
        <Col md={7}>
          <img src={hotel.imageUrl} alt={hotel.name} className="img-fluid rounded w-100" style={{ maxHeight: 360, objectFit: 'cover' }} />
        </Col>
        <Col md={5}>
          <h1 className="h3">{hotel.name} <span className="text-warning fs-6">{'★'.repeat(hotel.stars)}</span></h1>
          <p className="text-muted">{hotel.address}, {hotel.city}</p>
          <p>{hotel.description}</p>
        </Col>
      </Row>

      <h2 className="h5 mt-4">Chọn ngày để xem phòng trống</h2>
      <SearchBar showDestination={false} target={`/hotels/${hotel.id}`} initial={{ checkIn, checkOut, guests }} />

      <h2 className="h5 mt-4">Các loại phòng ({nights} đêm, {guests} khách)</h2>
      <Card>
        <Table responsive className="mb-0 align-middle">
          <thead>
            <tr><th>Loại phòng</th><th>Sức chứa</th><th>Giá / đêm</th><th>Tổng</th><th>Còn trống</th><th /></tr>
          </thead>
          <tbody>
            {hotel.rooms.map((r) => {
              const tooMany = guests > r.capacity;
              const soldOut = r.available < 1;
              return (
                <tr key={r.id}>
                  <td className="fw-semibold">{r.name}</td>
                  <td>{r.capacity} khách</td>
                  <td>{vnd(r.pricePerNight)}</td>
                  <td className="price">{vnd(r.pricePerNight * Math.max(nights, 0))}</td>
                  <td>{soldOut ? <Badge bg="secondary">Hết phòng</Badge> : <Badge bg="success">{r.available} phòng</Badge>}</td>
                  <td className="text-end">
                    <Button className="btn-bk" size="sm" disabled={soldOut || tooMany || nights < 1} onClick={() => onBook(r)}>
                      {tooMany ? 'Quá sức chứa' : 'Đặt ngay'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Modal show={!!selected} onHide={() => setSelected(null)} centered>
        <Modal.Header closeButton><Modal.Title>Xác nhận đặt phòng</Modal.Title></Modal.Header>
        <Modal.Body>
          {selected && (
            <>
              <p className="mb-1"><strong>{hotel.name}</strong> – {selected.name}</p>
              <p className="mb-1">Nhận phòng: {checkIn} · Trả phòng: {checkOut} ({nights} đêm)</p>
              <p className="mb-1">Số khách: {guests}</p>
              <p className="price mb-0">Tổng: {vnd(selected.pricePerNight * nights)}</p>
              {bookError && <Alert variant="danger" className="mt-3 mb-0">{bookError}</Alert>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setSelected(null)}>Đóng</Button>
          <Button className="btn-bk" onClick={confirm} disabled={submitting}>
            {submitting ? 'Đang đặt…' : 'Xác nhận đặt phòng'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
