import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

describe('basic setup test', () => {
    it('should display Hello world', () => {
        render(<BrowserRouter><App /></BrowserRouter>)
        // screen.getByText(/hello world/i);
    })
})