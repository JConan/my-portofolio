import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import MenuBar from "./MenuBar";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

describe("MenuBar provide navigation items", () => {
  const history = createBrowserHistory();
  beforeEach(() => {
    history.push("/");
    render(
      <Router history={history}>
        <MenuBar />
      </Router>
    );
  });
  afterEach(cleanup);

  it("should have a title", () => {
    screen.getByRole("link", { name: "home" });
  });

  it("should have a link to home", () => {
    history.push("/something");
    var link = screen.getByRole("link", { name: /home/i });
    link.click();
    expect(history.location.pathname).toEqual("/");
  });

  it("should have a link to demo-app Vidly", () => {
    history.push("/");
    let links = screen.getAllByRole("link", { name: "Vidly" });
    expect(links).toHaveLength(2);

    expect(links[0]).not.toHaveClass("active");
    links[0].click();
    expect(history.location.pathname).toEqual("/vidly");
    expect(links[0]).toHaveClass("active");
  });

  it("should have show vidly menu after routed to /vidly", () => {
    let name = /movie|customers|rentals|login|register/i;
    history.push("/");
    expect(screen.queryAllByRole("link", { name })).toHaveLength(0);

    history.push("/vidly");
    expect(screen.queryAllByRole("link", { name })).toHaveLength(5);
  });
});
