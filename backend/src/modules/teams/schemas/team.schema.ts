import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: '' })
  logoUrl: string;

  @Prop({ required: true, enum: ['Style 1', 'Style 2'] })
  style: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'verified' | 'rejected';

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: false })
  isBlocked: boolean;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
