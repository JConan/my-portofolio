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
})