import React from "react";
import "./App.sass";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min'
import { Link } from "react-router-dom";
import * as Icons from "react-bootstrap-icons"

function App() {
  return (
    <div className="app">
      <header>
        <nav className="navbar navbar-light" style={{ background: "#e3f2fd" }} >
          <div className="container">
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#main-navbar" aria-controls="main-navbar" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <Link to="/" className="navbar-brand"><Icons.HouseFill /></Link>
            <div className="collapse navbar-collapse" id="main-navbar">
              <div className="navbar-nav">
                <a className="nav-link active" aria-current="page" href="/">Home</a>
                <a className="nav-link" href="/">Vidly</a>
              </div>
            </div>
          </div>
        </nav>
        <nav className="navbar navbar-expand-sm navbar-light" style={{ background: "#e3f2fd" }}>
          <div className="container-fluid">
            <Link to="/" className="navbar-brand">Apps &gt;</Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#second-navbar" aria-controls="second-navbar" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="second-navbar">
              <div className="navbar-nav">
                <a className="nav-link active" aria-current="page" href="/">Vidly</a>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}

export default App;
