import { configRouter } from "@:app.tools";
import ControllerMovies from "./ControllerMovies";
import { IMovie } from "./Models";

interface IResourceMovie {
  id: string;
  title: string;
  genre: string;
  rate: number;
  stock: number;
}

const mappingMovieResources = (m: IMovie): IResourceMovie => ({
  id: String(m._id),
  title: m.title,
  genre: m.genre,
  rate: m.rate,
  stock: m.stock,
});

export const RouteMovies: configRouter = (route) => {
  route.get("/movies", async (req, res) => {
    const result: Array<IResourceMovie> = (
      await ControllerMovies.getMovies()
    ).map(mappingMovieResources);
    res.send(result);
  });

  route.get("/movies/:id", async (req, res) => {
    const id = req.params.id;
    const data = await ControllerMovies.getMovie(id);
    if (data !== null) {
      res.send(mappingMovieResources(data));
    } else {
      res.sendStatus(404);
    }
  });
};
