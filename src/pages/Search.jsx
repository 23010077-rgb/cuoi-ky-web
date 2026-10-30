import { useEffect, useState } from 'react';
import { Alert, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import http, { errorMessage } from '../api/http';
import HotelCard from '../components/HotelCard';
import SearchBar from '../components/SearchBar';

export default function Search() {
  const [params] = useSearchParams();
  const [stars, setStars] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const initial = {
    destination: params.get('destination') ?? '',
    checkIn: params.get('checkIn') ?? undefined,
    checkOut: params.get('checkOut') ?? undefined,
    guests: Number(params.get('guests')) || 2,
  };
  const carry = new URLSearchParams();
  ['checkIn', 'checkOut', 'guests'].forEach((k) => params.get(k) && carry.set(k, params.get(k)));

  useEffect(() => {
    setLoading(true);
    setError('');
    const query = {};
    if (initial.destination) query.destination = initial.destination;
    if (params.get('guests')) query.guests = params.get('guests');
    if (stars) query.stars = stars;
    if (maxPrice) query.maxPrice = maxPrice;
    http.get('/hotels', { params: query })
      .then((r) => setHotels(r.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [params, stars, maxPrice]);

  return (
    <Container className="py-4">
      <SearchBar initial={initial} />
      <Row className="mt-4">
        <Col md={3} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title className="h6">Bộ lọc</Card.Title>
              <Form.Group className="mb-3">
                <Form.Label className="small">Hạng sao tối thiểu</Form.Label>
                <Form.Select value={stars} onChange={(e) => setStars(e.target.value)}>
                  <option value="">Tất cả</option>
                  {[2, 3, 4, 5].map((s) => <option key={s} value={s}>{s} sao trở lên</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label className="small">Giá tối đa / đêm</Form.Label>
                <Form.Select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
                  <option value="">Không giới hạn</option>
                  <option value="500000">≤ 500.000 đ</option>
                  <option value="1000000">≤ 1.000.000 đ</option>
                  <option value="2000000">≤ 2.000.000 đ</option>
                  <option value="5000000">≤ 5.000.000 đ</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
        <Col md={9}>
          {loading && <div className="text-center py-5"><Spinner animation="border" /></div>}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && !error && (
            <>
              <h1 className="h5 mb-3">{hotels.length} chỗ nghỉ phù hợp</h1>
              {hotels.length === 0 && <Alert variant="info">Không có kết quả. Thử đổi điểm đến hoặc bỏ bớt bộ lọc.</Alert>}
              {hotels.map((h) => <HotelCard key={h.id} hotel={h} query={carry.toString()} />)}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}
