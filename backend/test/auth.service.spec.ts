import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../src/auth/auth.service';
import { Role } from '../src/common/role.enum';
import { UsersService } from '../src/users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  const users = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    create: jest.fn(),
  };
  const jwt = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };

  beforeEach(async () => {
    jest.clearAllMocks();
    const mod = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = mod.get(AuthService);
  });

  describe('register', () => {
    it('thành công: băm mật khẩu và không trả passwordHash', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockImplementation(async (d) => ({ id: 'u1', role: Role.USER, ...d }));

      const res = await service.register({ email: 'A@Mail.com', fullName: ' An ', password: 'Abcdef12' });

      const saved = users.create.mock.calls[0][0];
      expect(saved.email).toBe('a@mail.com');
      expect(saved.passwordHash).not.toBe('Abcdef12');
      expect(await bcrypt.compare('Abcdef12', saved.passwordHash)).toBe(true);
      expect(res).not.toHaveProperty('passwordHash');
    });

    it('lỗi: email đã tồn tại -> 409', async () => {
      users.findByEmail.mockResolvedValue({ id: 'x' });
      await expect(
        service.register({ email: 'a@mail.com', fullName: 'An', password: 'Abcdef12' }),
      ).rejects.toThrow(ConflictException);
      expect(users.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('thành công: trả token và user không có passwordHash', async () => {
      const passwordHash = await bcrypt.hash('Abcdef12', 4);
      users.findByEmailWithPassword.mockResolvedValue({
        id: 'u1', email: 'a@mail.com', role: Role.USER, passwordHash,
      });
      const res = await service.login({ email: 'a@mail.com', password: 'Abcdef12' });
      expect(res.token).toBe('signed.jwt.token');
      expect(res.user).not.toHaveProperty('passwordHash');
      expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1', email: 'a@mail.com', role: Role.USER });
    });

    it('lỗi: sai mật khẩu -> 401', async () => {
      const passwordHash = await bcrypt.hash('Abcdef12', 4);
      users.findByEmailWithPassword.mockResolvedValue({ id: 'u1', email: 'a@mail.com', passwordHash });
      await expect(service.login({ email: 'a@mail.com', password: 'sai' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lỗi: email không tồn tại -> 401 cùng thông báo', async () => {
      users.findByEmailWithPassword.mockResolvedValue(null);
      await expect(service.login({ email: 'no@mail.com', password: 'x' })).rejects.toThrow(
        'Email hoặc mật khẩu không đúng',
      );
    });
  });

  describe('me', () => {
    it('lỗi: user đã bị xoá -> 401', async () => {
      users.findById.mockResolvedValue(null);
      await expect(service.me('u9')).rejects.toThrow(UnauthorizedException);
    });
  });
});
