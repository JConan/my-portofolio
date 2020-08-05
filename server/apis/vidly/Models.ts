import db from "@:lib/db.connection";
import { Schema, Document, Model } from "mongoose";

const { vidly } = db.getConnections();

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

export interface VidlyModels {
  movie: Model<IMovie, {}>;
}

const models = {
  movie: vidly.model<IMovie>("Movies", MovieSchema),
};
export default models;
