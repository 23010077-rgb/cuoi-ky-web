import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { Role } from './common/role.enum';
import { Hotel } from './hotels/hotel.entity';
import { Room } from './hotels/room.entity';
import { User } from './users/user.entity';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const ds = app.get(DataSource);

  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@example.com').toLowerCase();
  const users = ds.getRepository(User);
  if (!(await users.findOne({ where: { email: adminEmail } }))) {
    await users.save(
      users.create({
        email: adminEmail,
        fullName: 'Quản trị viên',
        passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'Admin@12345', 12),
        role: Role.ADMIN,
      }),
    );
    console.log('Đã tạo tài khoản admin:', adminEmail);
  }

  const hotels = ds.getRepository(Hotel);
  if ((await hotels.count()) === 0) {
    const room = (name: string, pricePerNight: number, capacity: number, quantity: number) =>
      Object.assign(new Room(), { name, pricePerNight, capacity, quantity });

    const data: Partial<Hotel>[] = [
      { name: 'Hanoi Old Quarter Hotel', city: 'Hà Nội', address: '12 Hàng Bạc, Hoàn Kiếm', stars: 4,
        description: 'Khách sạn giữa phố cổ, gần Hồ Gươm và chợ đêm.',
        imageUrl: 'https://picsum.photos/seed/hanoi1/800/500',
        rooms: [room('Phòng Standard', 850000, 2, 5), room('Phòng Family', 1400000, 4, 3)] },
      { name: 'Sunrise Beach Resort', city: 'Đà Nẵng', address: '99 Võ Nguyên Giáp, Sơn Trà', stars: 5,
        description: 'Resort sát biển Mỹ Khê, hồ bơi vô cực.',
        imageUrl: 'https://picsum.photos/seed/danang1/800/500',
        rooms: [room('Deluxe Ocean View', 2200000, 2, 6), room('Suite 2 phòng ngủ', 4200000, 4, 2)] },
      { name: 'Saigon Central Hotel', city: 'TP. Hồ Chí Minh', address: '45 Nguyễn Huệ, Quận 1', stars: 4,
        description: 'Vị trí trung tâm, gần phố đi bộ Nguyễn Huệ.',
        imageUrl: 'https://picsum.photos/seed/saigon1/800/500',
        rooms: [room('Phòng Superior', 1100000, 2, 8), room('Phòng Executive', 1900000, 3, 4)] },
      { name: 'Phu Quoc Garden Villa', city: 'Phú Quốc', address: 'Bãi Trường, Dương Tơ', stars: 5,
        description: 'Biệt thự có vườn nhiệt đới, cách biển 200 m.',
        imageUrl: 'https://picsum.photos/seed/phuquoc1/800/500',
        rooms: [room('Villa 1 phòng ngủ', 3200000, 3, 4), room('Villa 3 phòng ngủ', 6500000, 6, 2)] },
      { name: 'Budget Inn Hanoi', city: 'Hà Nội', address: '8 Tạ Hiện, Hoàn Kiếm', stars: 2,
        description: 'Lựa chọn tiết kiệm, sạch sẽ, gần phố Tây.',
        imageUrl: 'https://picsum.photos/seed/hanoi2/800/500',
        rooms: [room('Phòng đôi', 450000, 2, 10)] },
    ];
    for (const h of data) await hotels.save(hotels.create(h));
    console.log('Đã tạo dữ liệu khách sạn mẫu');
  }

  await app.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
