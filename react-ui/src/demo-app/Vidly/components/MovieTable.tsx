import * as React from "react";
import * as Icons from "react-bootstrap-icons";
import "./MovieTable.sass";

export interface Movie {
  id: string;
  title: string;
  genre: string;
  stock: number;
  rate: number;
  liked?: boolean;
}

export interface MovieTableProps {
  movies?: Array<Movie>;
  onMovieLike?: (movie: Movie) => void;
  onMovieDelete?: (movie: Movie) => void;
}

const MovieTable: React.SFC<MovieTableProps> = (props) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th className="col">Title</th>
          <th className="col">Genre</th>
          <th className="col">Stock</th>
          <th className="col">Rate</th>
          <th className="col-3"></th>
        </tr>
      </thead>
      <tbody>
        {props.movies?.map((movie) => (
          <tr key={movie.id}>
            <td>{movie.title}</td>
            <td>{movie.genre}</td>
            <td>{movie.stock}</td>
            <td>{movie.rate}</td>
            <td className="buttons">
              <span
                aria-label="like button"
                aria-pressed={movie.liked}
                role="button"
                className="likeButton"
                onClick={() => props.onMovieLike?.(movie)}
              >
                {movie.liked ? (
                  <Icons.HeartFill className="liked" color={"darkred"} />
                ) : (
                  <Icons.Heart color={"darkred"} />
                )}
              </span>
              <span
                aria-label="delete button"
                role="button"
                className="deleteButton"
                onClick={() => props.onMovieDelete?.(movie)}
              >
                <Icons.Trash color="darkred" />
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MovieTable;
