import { configRouter } from "@:app.tools";
import ControllerMovies from "./ControllerMovies";
import { IMovie } from "./ModelMovies";

interface IResourceMovie {
  id: string;
  title: string;
  genre: string;
  rate: number;
  stock: number;
}

export const RouteMovies: configRouter = (route) => {
  route.get("/movies", async (req, res) => {
    const result: Array<IResourceMovie> = (
      await ControllerMovies.getMovies()
    ).map((m: IMovie) => ({
      id: String(m._id),
      title: m.title,
      genre: m.genre,
      rate: m.rate,
      stock: m.stock,
    }));
    res.send(result);
  });
};
