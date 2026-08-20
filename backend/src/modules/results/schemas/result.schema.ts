import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ResultDocument = Result & Document;

@Schema({ timestamps: true })
export class Result {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Program', required: true })
  programId: string;

  @Prop({ required: true, enum: ['Style 1', 'Style 2', 'Mixed'], default: 'Mixed' })
  styleCategory: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  firstPlace: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  secondPlace: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  thirdPlace: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  fourthPlace: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  fifthPlace: string;
}

export const ResultSchema = SchemaFactory.createForClass(Result);
ResultSchema.index({ programId: 1, styleCategory: 1 }, { unique: true });
