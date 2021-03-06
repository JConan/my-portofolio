import { Connection } from "mongoose"
import Models from "@:api.vidly/models"

export default (connection: Connection) => {
  const { MovieModel } = Models(connection)
  return {
    async getMovies() {
      return await MovieModel.find().populate("genres").limit(10).exec()
    },
    async getMovie(id: string) {
      return await MovieModel.findById(id).exec()
    },
  }
}
