import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '../common/role.enum';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HotelsService } from './hotels.service';
import { CreateHotelDto, CreateRoomDto, UpdateHotelDto } from './dto/create-hotel.dto';
import { AvailabilityQueryDto, SearchHotelsDto } from './dto/search-hotels.dto';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotels: HotelsService) {}

  @ApiOperation({ summary: 'Tìm kiếm khách sạn (công khai)' })
  @Get()
  search(@Query() q: SearchHotelsDto) {
    return this.hotels.search(q);
  }

  @ApiOperation({ summary: 'Chi tiết khách sạn + số phòng còn trống theo ngày (công khai)' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Query() q: AvailabilityQueryDto) {
    return this.hotels.findOne(id, q.checkIn, q.checkOut);
  }

  // ---- Chỉ ADMIN ----
  @ApiCookieAuth()
  @ApiOperation({ summary: '[Admin] Tạo khách sạn' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateHotelDto) {
    return this.hotels.create(dto);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: '[Admin] Cập nhật khách sạn' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHotelDto) {
    return this.hotels.update(id, dto);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: '[Admin] Xoá khách sạn' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hotels.remove(id);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: '[Admin] Thêm loại phòng cho khách sạn' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/rooms')
  addRoom(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateRoomDto) {
    return this.hotels.addRoom(id, dto);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: '[Admin] Xoá loại phòng' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('rooms/:roomId')
  removeRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.hotels.removeRoom(roomId);
  }
}
