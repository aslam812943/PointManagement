import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResultsController } from './results.controller.js';
import { ResultsService } from './results.service.js';
import { ResultsRepository } from './results.repository.js';
import { Result, ResultSchema } from './schemas/result.schema.js';
import { TeamsModule } from '../teams/teams.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema }]),
    TeamsModule,
  ],
  controllers: [ResultsController],
  providers: [ResultsService, ResultsRepository],
  exports: [ResultsService, ResultsRepository],
})
export class ResultsModule {}
