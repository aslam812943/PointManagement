import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema.js';
import { IRepository } from '../../common/interfaces/repository.interface.js';

@Injectable()
export class AdminRepository implements IRepository<AdminDocument> {
  constructor(@InjectModel(Admin.name) private adminModel: Model<AdminDocument>) {}

  async findAll(): Promise<AdminDocument[]> {
    return this.adminModel.find().exec();
  }

  async findById(id: string): Promise<AdminDocument | null> {
    return this.adminModel.findById(id).exec();
  }

  async findByUsername(username: string): Promise<AdminDocument | null> {
    return this.adminModel.findOne({ username }).exec();
  }

  async create(data: Partial<Admin>): Promise<AdminDocument> {
    const newAdmin = new this.adminModel(data);
    return newAdmin.save();
  }

  async update(id: string, data: Partial<Admin>): Promise<AdminDocument | null> {
    return this.adminModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.adminModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
