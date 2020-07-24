import * as React from "react";
import { getMovies } from "./services/fakeMovieService";
import MovieTable, { Movie } from "./components/MovieTable";
import "./Vidly.sass";
import { Switch, Route } from "react-router-dom";

export interface VidlyProps {}

const Vidly: React.SFC<VidlyProps> = () => {
  let [movies, setMovies] = React.useState<Array<Movie>>([]);
  React.useEffect(() => {
    setMovies(
      getMovies().map((movie) => ({
        id: movie._id,
        title: movie.title,
        genre: movie.genre.name,
        stock: movie.numberInStock,
        rate: movie.dailyRentalRate,
      }))
    );
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
