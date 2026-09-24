import { DataSource } from 'typeorm';
import { Student } from '../student/entities/student.entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'student_deadline_manager',
        entities: [Student],
        synchronize: true,
      });
      return dataSource.initialize();
    },
  },
];
