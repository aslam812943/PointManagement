import { Controller, Post, Body, UploadedFile, UseInterceptors, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TeamsService } from './teams.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('logo'))
  async register(
    @Body('name') name: string,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    return this.teamsService.registerTeam(name, logo);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllTeams() {
    return this.teamsService.getAllTeams();
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return this.teamsService.getAllVerifiedTeams();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'verified' | 'rejected',
  ) {
    return this.teamsService.updateTeamStatus(id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/block')
  async toggleBlock(
    @Param('id') id: string,
    @Body('isBlocked') isBlocked: boolean,
  ) {
    return this.teamsService.updateBlockStatus(id, isBlocked);
  }

  @Get(':id')
  async getTeam(@Param('id') id: string) {
    return this.teamsService.getTeamById(id);
  }
}
