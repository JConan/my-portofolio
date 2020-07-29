import mongoose, { Schema, Document } from "mongoose";

export interface IMovie extends Document {
  title: string;
  genre: string;
  stock: number;
  rate: number;
}

const MovieSchema: Schema = new Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  stock: { type: Number, required: true },
  rate: { type: Number, required: true },
});

export default mongoose.model<IMovie>("Movies", MovieSchema);
