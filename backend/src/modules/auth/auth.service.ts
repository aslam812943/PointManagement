import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, pass: string) {
    const admin = await this.adminService.findByUsername(username);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: admin.username, sub: admin._id };
    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        username: admin.username,
      }
    };
  }
}
