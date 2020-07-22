import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import Content from "./Content";

describe("Route in Content page", () => {
  let history = createBrowserHistory();
  beforeEach(() => {
    render(
      <Router history={history}>
        <Content />
      </Router>
    );
  });
  afterEach(cleanup);

  it("should be able to display Vidly content page", () => {
    history.push("/vidly");
    screen.getByText(/vidly content page/i);
  });

  it("should be able to display Home content page", () => {
    history.push("/");
    screen.getByText(/home content page/i);
  });
});
