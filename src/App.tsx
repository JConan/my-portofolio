import React from "react";
import "./App.sass";
import MenuBar from "./components/MenuBar";
import Content from "./components/Content";
import 'bootstrap/dist/css/bootstrap.min.css';


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
