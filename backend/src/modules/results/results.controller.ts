import { Controller, Post, Body, Get, Delete, Param, UseGuards, Put } from '@nestjs/common';
import { ResultsService } from './results.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async assign(@Body() data: {
    programId: string;
    styleCategory: string;
    firstPlace?: string;
    secondPlace?: string;
    thirdPlace?: string;
    fourthPlace?: string;
    fifthPlace?: string;
  }) {
    return this.resultsService.assignResults(data);
  }

  @Get()
  async findAll() {
    return this.resultsService.getAllResults();
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateResult(
    @Param('id') id: string,
    @Body() data: {
      firstPlace?: string;
      secondPlace?: string;
      thirdPlace?: string;
      fourthPlace?: string;
      fifthPlace?: string;
    }
  ) {
    return this.resultsService.updateResult(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.resultsService.deleteResult(id);
  }
}
