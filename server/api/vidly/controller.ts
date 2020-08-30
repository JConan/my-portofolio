import { Connection } from "mongoose"
import Models from "@:api.vidly/models"

export default (connection: Connection) => {
  const { MovieModel } = Models(connection)
  return {
    async getMovies() {
      return await MovieModel.find().exec()
    },
    async getMovie(id: string) {
      return await MovieModel.findById(id).exec()
    },
  }
}
