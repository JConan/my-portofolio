import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import MenuBar from './MenuBar';
import { createBrowserHistory } from "history"
import { Router } from 'react-router-dom';

describe('MenuBar provide navigation items', () => {
    const history = createBrowserHistory()
    beforeEach(() => {
        history.push('/')
        render(
            <Router history={history}>
                <MenuBar />
            </Router>
        )
    })
    afterEach(cleanup)

    it('should have a title', () => {
        screen.getByText(/my portofolio/i)
    })

    it('should have a link to home', () => {
        var button = screen.getByRole('link', { name: /home/i })
        button.click()
        expect(history.location.pathname).toEqual('/')
        expect(button.closest('li')).toHaveClass('menuitem-active')
    })

    it('should have a link to demo-app Vidly', () => {
        var button = screen.getByRole('link', { name: /vidly/i })
        button.click()
        expect(history.location.pathname).toEqual('/vidly')
        expect(button.closest('li')).toHaveClass('menuitem-active')
    })


})