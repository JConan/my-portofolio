import React from 'react';
import "./MenuBar.sass"
import { Link, useLocation } from 'react-router-dom';

export interface MenuBarProps {

}

const MenuBar: React.SFC<MenuBarProps> = () => {
    let location = useLocation()

    let buildClass = (path: string) =>
        location.pathname === path ? "menuitem menuitem-active" : "menuitem"

    return (
        <nav className="menubar">
            <ul className="menulist">
                <li><header>My Portofolio</header></li>
                <li className={buildClass("/vidly")}><Link to="/vidly">Vidly</Link></li>
                <li className={buildClass("/")}><Link to="/">Home</Link></li>
            </ul>
        </nav>
    );
}

export default MenuBar;