import { Connection } from "mongoose";
import Models from "@:api.vidly/models";

export default (connection: Connection) => {
  const { movie } = Models(connection);
  return {
    async getMovies() {
      return await movie.find().exec();
    },
    async getMovie(id: string) {
      return await movie.findById(id).exec();
    },
  };
};
