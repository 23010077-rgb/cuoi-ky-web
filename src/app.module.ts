import { Module } from '@nestjs/common';
import { StudentModule } from './student/student.module';
import { databaseProviders } from './database/database.provider';

@Module({
  imports: [StudentModule],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class AppModule {}
