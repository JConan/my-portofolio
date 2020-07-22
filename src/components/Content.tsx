import * as React from "react";
import { Switch, Route } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import HomePage from "./Home.md";
import "./Content.sass";

export interface ContentProps {}

const Content: React.SFC<ContentProps> = (props) => {
  let [homeContent, setHomeContent] = React.useState("");
  React.useEffect(() => {
    (async () => {
      let text = await (await fetch(HomePage)).text();
      setHomeContent(text);
    })();
  }, []);

  return (
    <div className="content">
      <Switch>
        <Route path="/vidly">
          <span style={{ visibility: "hidden", display: "none" }}>
            vidly content page
          </span>
        </Route>
        <Route path="/">
          <span style={{ visibility: "hidden", display: "none" }}>
            home content page
          </span>
          <ReactMarkdown source={homeContent} />
        </Route>
      </Switch>
    </div>
  );
};

export default Content;
