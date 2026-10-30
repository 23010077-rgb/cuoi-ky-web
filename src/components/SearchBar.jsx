import { useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { addDays } from '../api/format';

/**
 * Thanh tìm kiếm kiểu Booking.com: điểm đến, ngày nhận/trả, số khách -> 1 lần bấm "Tìm".
 * `target` quyết định chuyển tới trang nào (mặc định /search).
 */
export default function SearchBar({ initial = {}, showDestination = true, target = '/search' }) {
  const navigate = useNavigate();
  const [destination, setDestination] = useState(initial.destination ?? '');
  const [checkIn, setCheckIn] = useState(initial.checkIn ?? addDays(1));
  const [checkOut, setCheckOut] = useState(initial.checkOut ?? addDays(2));
  const [guests, setGuests] = useState(initial.guests ?? 2);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (checkOut <= checkIn) {
      setError('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }
    setError('');
    const params = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    if (showDestination && destination.trim()) params.set('destination', destination.trim());
    navigate(`${target}?${params.toString()}`);
  };

  return (
    <Form onSubmit={submit} className="bk-search" aria-label="Tìm kiếm khách sạn">
      <Row className="g-1">
        {showDestination && (
          <Col md={4}>
            <Form.Control
              type="text" placeholder="Bạn muốn đến đâu?" value={destination}
              onChange={(e) => setDestination(e.target.value)} maxLength={100}
              aria-label="Điểm đến"
            />
          </Col>
        )}
        <Col md={showDestination ? 2 : 4}>
          <Form.Control type="date" value={checkIn} min={addDays(0)} onChange={(e) => setCheckIn(e.target.value)} aria-label="Ngày nhận phòng" />
        </Col>
        <Col md={showDestination ? 2 : 4}>
          <Form.Control type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} aria-label="Ngày trả phòng" />
        </Col>
        <Col md={2}>
          <Form.Control type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(Number(e.target.value) || 1)} aria-label="Số khách" />
        </Col>
        <Col md={2}>
          <Button type="submit" className="btn-bk w-100 fw-bold">Tìm</Button>
        </Col>
      </Row>
      {error && <div className="text-danger bg-white rounded mt-1 px-2 py-1 small" role="alert">{error}</div>}
    </Form>
  );
}
