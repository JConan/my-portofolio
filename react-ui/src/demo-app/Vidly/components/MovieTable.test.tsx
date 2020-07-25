import * as React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import MovieTable, { Movie } from "./MovieTable";
import _ from "lodash";

describe("vidly table content", () => {
  let movie = {
    id: "1",
    title: "toto",
    genre: "action",
    rate: 4.5,
    stock: 1,
  };
  afterEach(cleanup);

  it("should have a table header", () => {
    render(<MovieTable />);
    let headers = ["Title", "Genre", "Stock", "Rate", ""];
    expect(
      screen.queryAllByRole("columnheader").map((element) => element.innerHTML)
    ).toEqual(headers);
  });

  it("should have like and delete button", () => {
    let onLikeButton = jest.fn();
    let onDeleteButton = jest.fn();
    render(
      <MovieTable
        movies={[movie]}
        onMovieLike={onLikeButton}
        onMovieDelete={onDeleteButton}
      />
    );
    screen.getByRole("button", { name: "like button" }).click();
    expect(onLikeButton).toBeCalledWith(movie);

    screen.getByRole("button", { name: "delete button" }).click();
    expect(onDeleteButton).toBeCalledWith(movie);
  });

  it("should able to display data", () => {
    let movies = _.range(10).map((id) => ({ ...movie, id: String(id) }));
    render(<MovieTable movies={movies} />);
    let rows = screen.getAllByRole("rowgroup")[1].children;
    expect(rows).toHaveLength(movies.length);
  });
});
