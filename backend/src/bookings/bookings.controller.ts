import {
  Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Req, UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../common/role.enum';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/create-booking.dto';

@ApiTags('Bookings')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @ApiOperation({ summary: 'Đặt phòng' })
  @Post()
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookings.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Đơn đặt phòng của tôi' })
  @Get('mine')
  mine(@Req() req: any) {
    return this.bookings.findMine(req.user.id);
  }

  @ApiOperation({ summary: 'Huỷ đơn của tôi' })
  @HttpCode(200)
  @Patch(':id/cancel')
  cancel(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.bookings.cancel(req.user.id, id);
  }

  @ApiOperation({ summary: '[Admin] Tất cả đơn đặt phòng' })
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.bookings.findAll();
  }

  @ApiOperation({ summary: '[Admin] Đổi trạng thái đơn' })
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookingStatusDto) {
    return this.bookings.updateStatus(id, dto.status);
  }
}
