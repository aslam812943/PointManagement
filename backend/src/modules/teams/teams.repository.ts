import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from './schemas/team.schema.js';
import { IRepository } from '../../common/interfaces/repository.interface.js';

@Injectable()
export class TeamsRepository implements IRepository<TeamDocument> {
  constructor(@InjectModel(Team.name) private teamModel: Model<TeamDocument>) {}

  async findAll(): Promise<TeamDocument[]> {
    return this.teamModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<TeamDocument | null> {
    return this.teamModel.findById(id).exec();
  }

  async create(data: Partial<Team>): Promise<TeamDocument> {
    const newTeam = new this.teamModel(data);
    return newTeam.save();
  }

  async update(id: string, data: Partial<Team>): Promise<TeamDocument | null> {
    return this.teamModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.teamModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findByName(name: string): Promise<TeamDocument | null> {
    return this.teamModel.findOne({ name }).exec();
  }

  async findAllVerified(): Promise<TeamDocument[]> {
    // Use $ne: true to include teams where isBlocked is false OR undefined
    return this.teamModel.find({ 
      status: 'verified', 
      isBlocked: { $ne: true } 
    }).sort({ totalPoints: -1 }).exec();
  }
}
