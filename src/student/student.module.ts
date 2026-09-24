import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { studentProviders } from './student.provider';

@Module({
  controllers: [StudentController],
  providers: [...studentProviders, StudentService],
})
export class StudentModule {}
