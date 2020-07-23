import * as React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import Vidly from './Vidly';

describe('vidly table content', () => {
    beforeEach(() => {
        render(<Vidly />)
    })
    afterEach(cleanup)

    it('should have a table header', () => {
        let headers = ["Title", "Genre", "Stock", "Rate", ""]
        expect(
            screen.queryAllByRole("columnheader")
                .map(element => element.innerHTML))
            .toEqual(headers)
    })

    it('should have a like button that can be toggled', () => {
        let button = screen.queryAllByRole('likeButton')[0]
        expect(button).not.toBeUndefined()
        expect(button.children[0]).not.toHaveClass('liked')

        button.click()
        expect(button.children[0]).toHaveClass('liked')

        button.click()
        expect(button.children[0]).not.toHaveClass('liked')
    })

    it('should have a delete button that remove row line', () => {
        let button = screen.queryAllByRole('deleteButton')[0]
        expect(button).not.toBeUndefined()

        let row = button.closest('tr')
        button.click()
        expect(row).not.toBeInTheDocument()
    })
})