import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamsController } from './teams.controller.js';
import { TeamsService } from './teams.service.js';
import { TeamsRepository } from './teams.repository.js';
import { Team, TeamSchema } from './schemas/team.schema.js';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    CloudinaryModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService, TeamsRepository],
  exports: [TeamsService, TeamsRepository],
})
export class TeamsModule {}
