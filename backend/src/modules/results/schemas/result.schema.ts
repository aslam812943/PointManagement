import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ResultDocument = Result & Document;

@Schema({ timestamps: true })
export class Result {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Program', required: true, unique: true })
  programId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  firstPlace: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  secondPlace: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  thirdPlace: string;
}

export const ResultSchema = SchemaFactory.createForClass(Result);
