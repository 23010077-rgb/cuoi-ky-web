import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export const BCRYPT_ROUNDS = 12;

function sanitize(user: User) {
  const { passwordHash, ...safe } = user as any;
  return safe;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('Email đã được sử dụng');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.create({ email, fullName: dto.fullName.trim(), passwordHash });
    return sanitize(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findByEmailWithPassword(email);
    const ok = user ? await bcrypt.compare(dto.password, user.passwordHash) : false;
    // Cùng một thông báo cho "sai email" và "sai mật khẩu" để không lộ email nào tồn tại
    if (!user || !ok) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const token = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
    return { token, user: sanitize(user) };
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return sanitize(user);
  }
}
