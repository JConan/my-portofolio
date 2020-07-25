import * as React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Content from "./Content";

describe("Route in Content page", () => {

  it("should be able to display Vidly content page", () => {
    render(
      <MemoryRouter initialEntries={["/vidly"]}>
        <Content />
      </MemoryRouter>
    );
    screen.getByText(/vidly content page/i);
  });

  it("should be able to display Home content page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Content />
      </MemoryRouter>
    );
    screen.getByText(/home content page/i);
  });
});
