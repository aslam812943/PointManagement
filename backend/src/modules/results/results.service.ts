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
    styleCategory: string;
    firstPlace: string;
    secondPlace: string;
    thirdPlace: string;
    fourthPlace?: string;
    fifthPlace?: string;
  }): Promise<ResultDocument> {
    const existingResult = await this.resultsRepository.findByProgramAndStyle(data.programId, data.styleCategory);
    if (existingResult) {
      throw new ConflictException(`Results already assigned for this program under ${data.styleCategory} category`);
    }

    // Prepare data by removing empty strings
    const resultData: any = {
      programId: data.programId,
      styleCategory: data.styleCategory,
      firstPlace: data.firstPlace || undefined,
      secondPlace: data.secondPlace || undefined,
      thirdPlace: data.thirdPlace || undefined,
      fourthPlace: data.fourthPlace || undefined,
      fifthPlace: data.fifthPlace || undefined,
    };

    // Assign points to teams
    if (resultData.firstPlace) await this.teamsService.addPoints(resultData.firstPlace, POINTS.FIRST);
    if (resultData.secondPlace) await this.teamsService.addPoints(resultData.secondPlace, POINTS.SECOND);
    if (resultData.thirdPlace) await this.teamsService.addPoints(resultData.thirdPlace, POINTS.THIRD);
    if (resultData.fourthPlace) await this.teamsService.addPoints(resultData.fourthPlace, POINTS.FOURTH);
    if (resultData.fifthPlace) await this.teamsService.addPoints(resultData.fifthPlace, POINTS.FIFTH);

    return this.resultsRepository.create(resultData);
  }

  async getAllResults(): Promise<ResultDocument[]> {
    return this.resultsRepository.findAll();
  }

  async deleteResult(id: string): Promise<boolean> {
    const result = await this.resultsRepository.findById(id);
    if (!result) throw new NotFoundException('Result not found');

    // Revert points
    if (result.firstPlace) await this.teamsService.removePoints((result.firstPlace as any)._id || result.firstPlace, POINTS.FIRST);
    if (result.secondPlace) await this.teamsService.removePoints((result.secondPlace as any)._id || result.secondPlace, POINTS.SECOND);
    if (result.thirdPlace) await this.teamsService.removePoints((result.thirdPlace as any)._id || result.thirdPlace, POINTS.THIRD);
    if ((result as any).fourthPlace) await this.teamsService.removePoints((result as any).fourthPlace._id || (result as any).fourthPlace, POINTS.FOURTH);
    if ((result as any).fifthPlace) await this.teamsService.removePoints((result as any).fifthPlace._id || (result as any).fifthPlace, POINTS.FIFTH);

    return this.resultsRepository.delete(id);
  }

  async getResultsByTeam(teamId: string): Promise<ResultDocument[]> {
    return this.resultsRepository.findAll(); // We'll filter and populate in the frontend or here
  }
}
