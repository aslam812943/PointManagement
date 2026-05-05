import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ResultsRepository } from './results.repository.js';
import { TeamsService } from '../teams/teams.service.js';
import { POINTS } from '../../common/constants/points.constant.js';
import { ResultDocument } from './schemas/result.schema.js';

@Injectable()
export class ResultsService {
  constructor(
    private readonly resultsRepository: ResultsRepository,
    private readonly teamsService: TeamsService,
  ) {}

  async assignResults(data: {
    programId: string;
    firstPlace: string;
    secondPlace: string;
    thirdPlace: string;
  }): Promise<ResultDocument> {
    const existingResult = await this.resultsRepository.findByProgramId(data.programId);
    if (existingResult) {
      throw new ConflictException('Results already assigned for this program');
    }

    // Prepare data by removing empty strings
    const resultData: any = {
      programId: data.programId,
      firstPlace: data.firstPlace || undefined,
      secondPlace: data.secondPlace || undefined,
      thirdPlace: data.thirdPlace || undefined,
    };

    // Assign points to teams
    if (resultData.firstPlace) await this.teamsService.addPoints(resultData.firstPlace, POINTS.FIRST);
    if (resultData.secondPlace) await this.teamsService.addPoints(resultData.secondPlace, POINTS.SECOND);
    if (resultData.thirdPlace) await this.teamsService.addPoints(resultData.thirdPlace, POINTS.THIRD);

    return this.resultsRepository.create(resultData);
  }

  async getAllResults(): Promise<ResultDocument[]> {
    return this.resultsRepository.findAll();
  }

  async deleteResult(id: string): Promise<boolean> {
    const result = await this.resultsRepository.findById(id);
    if (!result) throw new NotFoundException('Result not found');

    // Revert points
    if (result.firstPlace) await this.teamsService.removePoints((result.firstPlace as any)._id, POINTS.FIRST);
    if (result.secondPlace) await this.teamsService.removePoints((result.secondPlace as any)._id, POINTS.SECOND);
    if (result.thirdPlace) await this.teamsService.removePoints((result.thirdPlace as any)._id, POINTS.THIRD);

    return this.resultsRepository.delete(id);
  }

  async getResultsByTeam(teamId: string): Promise<ResultDocument[]> {
    return this.resultsRepository.findAll(); // We'll filter and populate in the frontend or here
  }
}
