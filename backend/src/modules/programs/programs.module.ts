import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgramsController } from './programs.controller.js';
import { ProgramsService } from './programs.service.js';
import { ProgramsRepository } from './programs.repository.js';
import { Program, ProgramSchema } from './schemas/program.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Program.name, schema: ProgramSchema }]),
  ],
  controllers: [ProgramsController],
  providers: [ProgramsService, ProgramsRepository],
  exports: [ProgramsService, ProgramsRepository],
})
export class ProgramsModule {}
