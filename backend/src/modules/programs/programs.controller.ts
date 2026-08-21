import { Controller, Post, Body, Get, Delete, Param, UseGuards, Patch } from '@nestjs/common';
import { ProgramsService } from './programs.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: { name: string, location: string, date: string }) {
    return this.programsService.createProgram(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: Partial<{ name: string, location: string, date: string }>) {
    return this.programsService.updateProgram(id, updateDto);
  }

  @Get()
  async findAll() {
    return this.programsService.getAllPrograms();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.programsService.deleteProgram(id);
  }
}
