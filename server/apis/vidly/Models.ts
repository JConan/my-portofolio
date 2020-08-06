import db from "@:lib/db.connection";
import { Schema, Document } from "mongoose";

const vidly = db.getConnection("vidly");

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

export default {
  movie: vidly.model<IMovie>("Movies", MovieSchema),
};
