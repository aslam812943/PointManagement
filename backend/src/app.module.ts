import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import databaseConfig from './config/database.config.js';
import jwtConfig from './config/jwt.config.js';
import cloudinaryConfig from './config/cloudinary.config.js';
import { CloudinaryModule } from './cloudinary/cloudinary.module.js';
import { TeamsModule } from './modules/teams/teams.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ProgramsModule } from './modules/programs/programs.module.js';
import { ResultsModule } from './modules/results/results.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, cloudinaryConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    CloudinaryModule,
    TeamsModule,
    AdminModule,
    AuthModule,
    ProgramsModule,
    ResultsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
