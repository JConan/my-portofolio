import React from "react";
import "./App.sass";
import MenuBar from "./components/MenuBar";
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
