import { useEffect, useState } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import http from '../api/http';
import SearchBar from '../components/SearchBar';

const POPULAR = ['Hà Nội', 'Đà Nẵng', 'TP. Hồ Chí Minh', 'Phú Quốc'];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    http.get('/hotels').then((r) => setFeatured(r.data.slice(0, 3))).catch(() => setFeatured([]));
  }, []);

  return (
    <>
      <section className="bk-hero">
        <Container>
          <h1 className="fw-bold">Tìm chỗ nghỉ tiếp theo của bạn</h1>
          <p className="fs-5 mb-0">Hàng trăm khách sạn, resort, villa với giá tốt nhất.</p>
        </Container>
      </section>
      <Container><SearchBar /></Container>

      <Container className="my-5">
        <h2 className="h4 mb-3">Điểm đến phổ biến</h2>
        <Row className="g-3">
          {POPULAR.map((c) => (
            <Col xs={6} md={3} key={c}>
              <Card as={Link} to={`/search?destination=${encodeURIComponent(c)}`} className="text-decoration-none h-100">
                <Card.Body className="text-center fw-semibold">{c}</Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {featured.length > 0 && (
          <>
            <h2 className="h4 mt-5 mb-3">Gợi ý cho bạn</h2>
            <Row className="g-3">
              {featured.map((h) => (
                <Col md={4} key={h.id}>
                  <Card as={Link} to={`/hotels/${h.id}`} className="text-decoration-none h-100">
                    <Card.Img variant="top" src={h.imageUrl} alt={h.name} loading="lazy" style={{ height: 180, objectFit: 'cover' }} />
                    <Card.Body>
                      <Card.Title className="h6 text-primary">{h.name}</Card.Title>
                      <Card.Text className="small text-muted">{h.city}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>
    </>
  );
}
