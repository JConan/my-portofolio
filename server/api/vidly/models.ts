import { Schema, Document, Connection, Types, Model } from "mongoose"

export interface Movie {
  tconst: string
  title: string
  year: number
  duration?: number
  genres: string[]
  stock?: number
  averageRate?: number
  totalVotes?: number
}

export interface Genre {
  name: string
}

export interface MovieDoc extends Movie, Document {}

export interface GenreDoc extends Genre, Document {}

const GenreSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
})

const MovieSchema: Schema = new Schema({
  tconst: { type: String, required: true, index: true, match: /tt[0-9]{7,}/i, unique: true },
  title: { type: String, required: true },
  year: { type: Number },
  duration: { type: Number },
  genres: [{ type: Types.ObjectId, ref: GenreSchema }],
  stock: { type: Number },
  averageRate: { type: Number },
  totalVotes: { type: Number },
})

var vidlyModels: {
  Movie: Model<MovieDoc>
  Genre: Model<GenreDoc>
}
export const InitializeModels = (connection: Connection) => {
  connection.model("movie", MovieSchema)
  connection.model("genre", GenreSchema)
  vidlyModels = {
    Movie: connection.model("movie"),
    Genre: connection.model("genre"),
  }
  return vidlyModels
}
export const MovieModel = () => vidlyModels.Movie
export const GenreModel = () => vidlyModels.Genre

export default InitializeModels
