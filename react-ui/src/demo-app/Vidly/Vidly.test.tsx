import * as React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import Vidly from "./Vidly";
import { Router } from "react-router-dom";
import { createBrowserHistory } from "history";

describe("vidly table content", () => {
  let history = createBrowserHistory();
  beforeEach(() => {
    history.push("/vidly/movie");
    render(
      <Router history={history}>
        <Vidly />
      </Router>
    );
  });
  afterEach(cleanup);

  it("should have a table header", () => {
    let headers = ["Title", "Genre", "Stock", "Rate", ""];
    expect(
      screen.queryAllByRole("columnheader").map((element) => element.innerHTML)
    ).toEqual(headers);
  });

  it("should have a like button that can be toggled", () => {
    let button = screen.queryAllByRole("button", { name: "like button" })[0];
    expect(button).not.toBeUndefined();
    expect(button).not.toHaveAttribute("aria-pressed", "true");

    button.click();
    expect(button).toHaveAttribute("aria-pressed", "true");

    button.click();
    expect(button).not.toHaveAttribute("aria-pressed", "true");
  });

  it("should have a delete button that remove row line", () => {
    let button = screen.queryAllByRole("button", { name: "delete button" })[0];
    expect(button).not.toBeUndefined();

    let row = button.closest("tr");
    button.click();
    expect(row).not.toBeInTheDocument();
  });

  it("should display customers page", () => {
    ["customers", "rentals", "login", "register"].forEach((pageName) => {
      history.push("/vidly/" + pageName);
      screen.getByText(new RegExp(pageName + " page", "i"));
    });
  });
});
