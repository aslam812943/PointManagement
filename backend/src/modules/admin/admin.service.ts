import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { AdminRepository } from './admin.repository.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async findByUsername(username: string) {
    return this.adminRepository.findByUsername(username);
  }

  async validateAdmin(username: string, pass: string): Promise<any> {
    const admin = await this.adminRepository.findByUsername(username);
    if (admin && await bcrypt.compare(pass, admin.password)) {
      const { password, ...result } = admin.toObject();
      return result;
    }
    return null;
  }
}
