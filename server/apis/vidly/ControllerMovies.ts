import Models from "@:app.vidly/Models";
import { getMovie } from "../../../react-ui/src/demo-app/Vidly/services/fakeMovieService";

export default {
  async getMovies() {
    return await Models.movie.find().exec();
  },
  async getMovie(id: string) {
    return await Models.movie.findById(id).exec();
  },
};
