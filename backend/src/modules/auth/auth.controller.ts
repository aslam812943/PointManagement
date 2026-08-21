import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  async validate() {
    return { valid: true };
  }
}
