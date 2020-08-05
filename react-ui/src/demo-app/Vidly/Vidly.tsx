import * as React from "react";
import MovieTable, { Movie } from "./components/MovieTable";
import { Switch, Route } from "react-router-dom";
import Axios from "axios";
import "./Vidly.sass";

export interface VidlyProps {}

const Vidly: React.SFC<VidlyProps> = () => {
  let [movies, setMovies] = React.useState<Array<Movie>>([]);
  React.useEffect(() => {
    (async () => {
      const _movies = (await Axios.get<Array<Movie>>("/api/vidly/movies")).data;
      setMovies(_movies);
    })();
  }, []);

  let likeButtonToggler = (toggleMovie: Movie) => {
    setMovies(
      movies.map((movie) =>
        movie.id === toggleMovie.id ? { ...movie, liked: !movie.liked } : movie
      )
    );
  };
  let deleteButton = (deleteMovie: Movie) => {
    setMovies(movies.filter((movie) => movie.id !== deleteMovie.id));
  };

  return (
    <React.Fragment>
      <Switch>
        <Route path="/vidly/movie">
          <MovieTable
            movies={movies}
            onMovieDelete={deleteButton}
            onMovieLike={likeButtonToggler}
          />
        </Route>
        <Route path="/vidly/customers">Customers Page</Route>
        <Route path="/vidly/rentals">Rentals Page</Route>
        <Route path="/vidly/login">Login Page</Route>
        <Route path="/vidly/register">Register Page</Route>
      </Switch>
    </React.Fragment>
  );
};

export default Vidly;
