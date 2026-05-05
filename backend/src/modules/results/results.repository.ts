import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Result, ResultDocument } from './schemas/result.schema.js';
import { IRepository } from '../../common/interfaces/repository.interface.js';

@Injectable()
export class ResultsRepository implements IRepository<ResultDocument> {
  constructor(@InjectModel(Result.name) private resultModel: Model<ResultDocument>) {}

  async findAll(): Promise<ResultDocument[]> {
    return this.resultModel.find().populate('firstPlace secondPlace thirdPlace').exec();
  }

  async findById(id: string): Promise<ResultDocument | null> {
    return this.resultModel.findById(id).populate('firstPlace secondPlace thirdPlace').exec();
  }

  async findByProgramId(programId: string): Promise<ResultDocument | null> {
    return this.resultModel.findOne({ programId }).exec();
  }

  async create(data: Partial<Result>): Promise<ResultDocument> {
    const newResult = new this.resultModel(data);
    return newResult.save();
  }

  async update(id: string, data: Partial<Result>): Promise<ResultDocument | null> {
    return this.resultModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.resultModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
