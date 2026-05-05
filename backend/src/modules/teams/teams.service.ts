import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { TeamsRepository } from './teams.repository.js';
import { CloudinaryService } from '../../cloudinary/cloudinary.service.js';
import { TeamDocument } from './schemas/team.schema.js';

@Injectable()
export class TeamsService {
  constructor(
    private readonly teamsRepository: TeamsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async registerTeam(name: string, logo: Express.Multer.File): Promise<TeamDocument> {
    const existingTeam = await this.teamsRepository.findByName(name);
    if (existingTeam) {
      throw new ConflictException('Team name already exists');
    }

    const uploadResult = await this.cloudinaryService.uploadFile(logo);
    
    return this.teamsRepository.create({
      name,
      logoUrl: uploadResult.secure_url,
      status: 'pending',
      totalPoints: 0,
    });
  }

  async getAllTeams(): Promise<TeamDocument[]> {
    return this.teamsRepository.findAll();
  }

  async getAllVerifiedTeams(): Promise<TeamDocument[]> {
    return this.teamsRepository.findAllVerified();
  }

  async getTeamById(id: string): Promise<TeamDocument | null> {
    return this.teamsRepository.findById(id);
  }

  async updateTeamStatus(id: string, status: 'verified' | 'rejected'): Promise<TeamDocument> {
    const team = await this.teamsRepository.update(id, { status });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async updateBlockStatus(id: string, isBlocked: boolean): Promise<TeamDocument> {
    const team = await this.teamsRepository.update(id, { isBlocked });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async addPoints(id: string, points: number): Promise<TeamDocument> {
    const team = await this.teamsRepository.findById(id);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    const updatedTeam = await this.teamsRepository.update(id, { totalPoints: team.totalPoints + points });
    if (!updatedTeam) {
      throw new NotFoundException('Team not found during update');
    }
    return updatedTeam;
  }

  async removePoints(id: string, points: number): Promise<TeamDocument> {
    const team = await this.teamsRepository.findById(id);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    const updatedTeam = await this.teamsRepository.update(id, { totalPoints: Math.max(0, team.totalPoints - points) });
    if (!updatedTeam) {
      throw new NotFoundException('Team not found during update');
    }
    return updatedTeam;
  }
}
