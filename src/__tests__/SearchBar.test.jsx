import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '../components/SearchBar';

const navigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));

const setup = (props) => render(<MemoryRouter><SearchBar {...props} /></MemoryRouter>);

describe('SearchBar', () => {
  beforeEach(() => navigate.mockClear());

  it('điều hướng tới /search với đúng tham số', async () => {
    setup({ initial: { checkIn: '2026-12-01', checkOut: '2026-12-03', guests: 2 } });
    await userEvent.type(screen.getByLabelText('Điểm đến'), 'Đà Nẵng');
    await userEvent.click(screen.getByRole('button', { name: 'Tìm' }));
    expect(navigate).toHaveBeenCalledTimes(1);
    const url = navigate.mock.calls[0][0];
    expect(url).toContain('/search?');
    expect(url).toContain('checkIn=2026-12-01');
    expect(url).toContain('checkOut=2026-12-03');
    expect(url).toContain('destination=%C4%90%C3%A0+N%E1%BA%B5ng');
  });

  it('báo lỗi và không điều hướng khi ngày trả <= ngày nhận', async () => {
    setup({ initial: { checkIn: '2026-12-05', checkOut: '2026-12-05' } });
    await userEvent.click(screen.getByRole('button', { name: 'Tìm' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Ngày trả phòng phải sau ngày nhận phòng');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('ẩn ô điểm đến khi showDestination=false', () => {
    setup({ showDestination: false });
    expect(screen.queryByLabelText('Điểm đến')).not.toBeInTheDocument();
  });
});
