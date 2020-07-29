import { IMovie } from "apis/vidly/ModelMovies";

export interface IControllerMovies {
  getMovies(): Array<IMovie>;
}

export class ControllerMovies implements IControllerMovies {
  getMovies(): IMovie[] {
    throw new Error("Method not implemented.");
  }
}
