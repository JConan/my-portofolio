import React from "react";
import MenuBar from "./components/MenuBar";
import "./App.sass";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min";
import Content from "./components/Content";

function App() {
  return (
    <div className="app">
      <MenuBar />
      <main>
        <Content />
      </main>
    </div>
  );
}

export default App;
