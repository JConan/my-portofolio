import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe('basic setup test', () => {
    it('should display Hello world', () => {
        render(<App />)
        screen.getByText(/hello world/i)
    })
})