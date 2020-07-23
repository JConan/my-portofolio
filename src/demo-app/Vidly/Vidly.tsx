import * as React from 'react';
import "./Vidly.sass"
import "./services/fakeMovieService"
import { getMovies } from './services/fakeMovieService';

export interface VidlyProps {

}

interface Movie {
    id: string,
    title: string,
    genre: string,
    stock: number,
    rate: number
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
                rate: movie.dailyRentalRate
            }))
        )
    }, [])


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
                            <td></td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

export default Vidly;