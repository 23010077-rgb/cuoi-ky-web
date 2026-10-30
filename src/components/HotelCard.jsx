import { Badge, Button, Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { vnd } from '../api/format';

export default function HotelCard({ hotel, query }) {
  return (
    <Card className="hotel-card mb-3 overflow-hidden">
      <Row className="g-0">
        <Col md={4}>
          {/* React tự escape nội dung; imageUrl đã được backend giới hạn http/https */}
          <img src={hotel.imageUrl || 'https://picsum.photos/seed/default/800/500'} alt={hotel.name} loading="lazy" />
        </Col>
        <Col md={8}>
          <Card.Body className="d-flex flex-column h-100">
            <div className="d-flex justify-content-between">
              <div>
                <Card.Title className="text-primary mb-0">{hotel.name}</Card.Title>
                <div className="text-warning" aria-label={`${hotel.stars} sao`}>{'★'.repeat(hotel.stars)}</div>
                <div className="small text-muted">{hotel.address}, {hotel.city}</div>
              </div>
              <Badge className="score-badge align-self-start">{hotel.stars}.0</Badge>
            </div>
            <Card.Text className="small mt-2 flex-grow-1">{hotel.description}</Card.Text>
            <div className="d-flex justify-content-between align-items-end">
              <span className="small text-muted">{hotel.rooms?.length ?? 0} loại phòng</span>
              <div className="text-end">
                {hotel.minPrice != null && (
                  <div><span className="small text-muted">Từ </span><span className="price">{vnd(hotel.minPrice)}</span><span className="small text-muted"> / đêm</span></div>
                )}
                <Button as={Link} to={`/hotels/${hotel.id}${query ? `?${query}` : ''}`} className="btn-bk mt-1">Xem chỗ trống</Button>
              </div>
            </div>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}
