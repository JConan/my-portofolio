import * as React from 'react';
import * as Icons from 'react-bootstrap-icons';
import { getMovies } from './services/fakeMovieService';
import "./Vidly.sass"

export interface VidlyProps {

}

interface Movie {
    id: string,
    title: string,
    genre: string,
    stock: number,
    rate: number,
    liked?: boolean
}

const Vidly: React.SFC<VidlyProps> = () => {
    let [movies, setMovies] = React.useState<Array<Movie>>([]);

    React.useEffect(() => {
        setMovies(
            getMovies().map(movie => ({
                id: movie._id,
                title: movie.title,
                genre: movie.genre.name,
                stock: movie.numberInStock,
                rate: movie.dailyRentalRate,
            }))
        )
    }, [])

    let likeButtonToggler = (movieId: string) => {
        setMovies(movies.map(movie => movie.id === movieId ? { ...movie, liked: !movie.liked } : movie))
    }
    let deleteButton = (movieId: string) => {
        setMovies(movies.filter(movie => movie.id !== movieId))
    }

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
                {
                    movies.map(movie => (
                        <tr key={movie.id}>
                            <td>{movie.title}</td>
                            <td>{movie.genre}</td>
                            <td>{movie.stock}</td>
                            <td>{movie.rate}</td>
                            <td className="buttons">
                                <span aria-label="like button" aria-pressed={movie.liked} role="button" className="likeButton" onClick={() => likeButtonToggler(movie.id)}>
                                    {
                                        movie.liked ?
                                            <Icons.HeartFill className="liked" color={"darkred"} />
                                            :
                                            <Icons.Heart color={"darkred"} />
                                    }
                                </span>
                                <span aria-label="delete button" role="button" className="deleteButton" onClick={() => deleteButton(movie.id)}>
                                    <Icons.Trash color="darkred" />
                                </span>
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

export default Vidly;