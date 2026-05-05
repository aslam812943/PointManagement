import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  logoUrl: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'verified' | 'rejected';

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: false })
  isBlocked: boolean;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
