import { Schema, Document, Connection, Types, Model } from "mongoose"

export interface IMovie {
  tconst: string
  title: string
  year: number
  duration?: number
  genres: Array<IGenre>
  stock?: number
  averageRate?: number
  totalVotes?: number
}

export interface IGenre {
  name: string
}

export interface MovieDoc extends IMovie, Document {
  genres: Array<GenreDoc>
}

export interface GenreDoc extends IGenre, Document {}

const GenreSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
})

const MovieSchema: Schema = new Schema({
  tconst: { type: String, required: true, index: true, match: /tt[0-9]{7,}/i, unique: true },
  title: { type: String, required: true },
  year: { type: Number },
  duration: { type: Number },
  genres: [{ type: Types.ObjectId, ref: "genre" }],
  stock: { type: Number },
  averageRate: { type: Number },
  totalVotes: { type: Number },
})

export type MovieModelType = Model<MovieDoc>
export type GenreModelType = Model<GenreDoc>

var vidlyModels: {
  MovieModel: Model<MovieDoc>
  GenreModel: Model<GenreDoc>
}
export const initializeModels = (connection: Connection) => {
  connection.model("movie", MovieSchema)
  connection.model("genre", GenreSchema)
  vidlyModels = {
    MovieModel: connection.model("movie"),
    GenreModel: connection.model("genre"),
  }
  return vidlyModels
}
export const MovieModel = () => vidlyModels.MovieModel
export const GenreModel = () => vidlyModels.GenreModel

export default initializeModels
