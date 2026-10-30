import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../src/common/role.enum';
import { RolesGuard } from '../src/common/roles.guard';

const ctx = (user: any): ExecutionContext =>
  ({
    getHandler: () => null,
    getClass: () => null,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as any;

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it('cho qua khi route không yêu cầu vai trò', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(ctx({ role: Role.USER }))).toBe(true);
  });
  it('cho ADMIN vào route admin', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    expect(guard.canActivate(ctx({ role: Role.ADMIN }))).toBe(true);
  });
  it('chặn USER thường vào route admin', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    expect(guard.canActivate(ctx({ role: Role.USER }))).toBe(false);
  });
  it('chặn khi chưa đăng nhập', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    expect(guard.canActivate(ctx(undefined))).toBe(false);
  });
});
