import * as React from "react";
import { getMovies } from "./services/fakeMovieService";
import MovieTable, { Movie } from "./components/MovieTable";
import "./Vidly.sass";

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
    <MovieTable
      movies={movies}
      onMovieDelete={deleteButton}
      onMovieLike={likeButtonToggler}
    />
  );
};

export default Vidly;
