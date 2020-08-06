import Models from "@:app.vidly/Models";

export default {
  async getMovies() {
    return await Models.movie.find().exec();
  },
  async getMovie(id: string) {
    return await Models.movie.findById(id).exec();
  },
};
