import { describe, expect, it } from 'vitest';
import { errorMessage } from '../api/http';

describe('errorMessage', () => {
  it('gộp mảng lỗi validate', () => {
    expect(errorMessage({ response: { status: 400, data: { message: ['A', 'B'] } } })).toBe('A. B');
  });
  it('hiện thông báo 4xx từ server', () => {
    expect(errorMessage({ response: { status: 401, data: { message: 'Sai mật khẩu' } } })).toBe('Sai mật khẩu');
  });
  it('lỗi 5xx -> thông báo chung, không lộ chi tiết', () => {
    expect(errorMessage({ response: { status: 500, data: { message: 'SELECT * FROM users failed' } } }))
      .toBe('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
  });
  it('mất kết nối', () => {
    expect(errorMessage({})).toContain('Không thể kết nối');
  });
});
