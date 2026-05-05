import { Injectable } from '@nestjs/common';
import { ProgramsRepository } from './programs.repository.js';
import { ProgramDocument } from './schemas/program.schema.js';

@Injectable()
export class ProgramsService {
  constructor(private readonly programsRepository: ProgramsRepository) {}

  async createProgram(data: { name: string, location: string, date: string }): Promise<ProgramDocument> {
    return this.programsRepository.create(data);
  }

  async getAllPrograms(): Promise<ProgramDocument[]> {
    return this.programsRepository.findAll();
  }

  async getProgramsByDate(date: string): Promise<ProgramDocument[]> {
    return this.programsRepository.findByDate(date);
  }

  async deleteProgram(id: string): Promise<boolean> {
    return this.programsRepository.delete(id);
  }
}
