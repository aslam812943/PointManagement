import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Program, ProgramDocument } from './schemas/program.schema.js';
import { IRepository } from '../../common/interfaces/repository.interface.js';

@Injectable()
export class ProgramsRepository implements IRepository<ProgramDocument> {
  constructor(@InjectModel(Program.name) private programModel: Model<ProgramDocument>) {}

  async findAll(): Promise<ProgramDocument[]> {
    return this.programModel.find().sort({ date: 1 }).exec();
  }

  async findById(id: string): Promise<ProgramDocument | null> {
    return this.programModel.findById(id).exec();
  }

  async create(data: Partial<Program>): Promise<ProgramDocument> {
    const newProgram = new this.programModel(data);
    return newProgram.save();
  }

  async update(id: string, data: Partial<Program>): Promise<ProgramDocument | null> {
    return this.programModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.programModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findByDate(date: string): Promise<ProgramDocument[]> {
    return this.programModel.find({ date }).exec();
  }
}
