import ModelMovies from "@:app.vidly/ModelMovies";

export default {
  async getMovies() {
    return await ModelMovies.find().exec();
  },
};
