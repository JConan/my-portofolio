import React, { SFC } from "react";
import { Link, useLocation, Switch, Route } from "react-router-dom";
import * as Icons from "react-bootstrap-icons";
import "./MenuBar.sass";

export interface MenuBarProps {}

const MenuBar: SFC<MenuBarProps> = () => {
  let location = useLocation();

  let name = location.pathname.split("/")[1];

  return (
    <header>
      <MainMenu>
        <MenuLink name="Vidly" to="/vidly" mainMenu />
      </MainMenu>
      <SecondMenu name={name}>
        <Switch>
          <Route path="/vidly">
            <MenuLink name="Movie" to="/vidly/movie" />
            <MenuLink name="Customers" to="/vidly/customers" />
            <MenuLink name="Rentals" to="/vidly/rentals" />
            <MenuLink name="Login" to="/vidly/login" />
            <MenuLink name="Register" to="/vidly/register" />
          </Route>
          <Route path="/">
            <MenuLink name="Vidly" to="/vidly" />
          </Route>
        </Switch>
      </SecondMenu>
    </header>
  );
};

interface MenuLinkProps {
  to: string;
  name: string;
  className?: string;
  mainMenu?: boolean;
}

const MenuLink: SFC<MenuLinkProps> = (props) => {
  let location = useLocation();
  let navLinkClass = (path: string) =>
    location.pathname.startsWith(path)
      ? "nav-link active menulink-active"
      : "nav-link";

  return (
    <Link
      aria-label={props.name}
      role="link"
      className={props.className ? props.className : navLinkClass(props.to)}
      to={props.to}
      onClick={() => {
        ["main-menutoggler", "second-menutoggler"].forEach((id) => {
          let toggler = document.getElementById(id);
          if (toggler?.getAttribute("aria-expanded") === "true")
            toggler.click();
        });
      }}
    >
      {props.children || props.name}
    </Link>
  );
};

const MainMenu: SFC<{}> = (props) => {
  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <button
          id="main-menutoggler"
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#main-navbar"
          aria-controls="main-navbar"
          aria-expanded="false"
          aria-label="Toggle main-navbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <MenuLink name="home" to="/" className="navbar-brand">
          <Icons.HouseFill />
        </MenuLink>
        <div className="collapse navbar-collapse" id="main-navbar">
          <div className="navbar-nav">{props.children}</div>
        </div>
      </div>
    </nav>
  );
};

const SecondMenu: SFC<{ name: string }> = (props) => {
  return (
    <nav className="navbar navbar-expand-sm navbar-light">
      <div className="container-fluid">
        <b
          className="navbar-brand"
          style={{ textTransform: "capitalize", color: "#042f66" }}
        >
          {props.name === "" ? "apps" : props.name}
        </b>

        <button
          id="second-menutoggler"
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#second-navbar"
          aria-controls="second-navbar"
          aria-expanded="false"
          aria-label="Toggle second-navbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="second-navbar">
          <div className="navbar-nav">{props.children}</div>
        </div>
      </div>
    </nav>
  );
};

export default MenuBar;
