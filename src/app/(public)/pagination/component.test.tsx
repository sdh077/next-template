// __tests__/Pagination.test.js

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // Jest 확장을 사용하여 더 많은 assertion 사용

import Pagination from './Pagination';

test('renders Pagination with initial count', () => {
    const data = [
        { id: 4, name: 'Item 4' },
        { id: 5, name: 'Item 5' },
        { id: 6, name: 'Item 6' },
        { id: 7, name: 'Item 7' },
        { id: 8, name: 'Item 8' },
        { id: 9, name: 'Item 9' },
        { id: 10, name: 'Item 10' },
        { id: 11, name: 'Item 11' },
        { id: 12, name: 'Item 12' },
        { id: 13, name: 'Item 13' },
        { id: 14, name: 'Item 14' },
        { id: 15, name: 'Item 15' },
        { id: 16, name: 'Item 16' },
        { id: 17, name: 'Item 17' },
        { id: 18, name: 'Item 18' },
        { id: 19, name: 'Item 19' },
        { id: 20, name: 'Item 20' },
        { id: 21, name: 'Item 21' },
        { id: 22, name: 'Item 22' },
        { id: 23, name: 'Item 23' }
    ]
    const { getByText } = render(<Pagination data={data} />);
  expect(getByText('Count: 0')).toContain('item 1')
});

// test('increments count when Increment button is clicked', () => {
//     const { getByText } = render(<Page />);
//   const incrementButton = getByText('Increment');

//     fireEvent.click(incrementButton);

//     expect(getByText('Count: 1')).toBeInTheDocument();
// });

// test('decrements count when Decrement button is clicked', () => {
//     const { getByText } = render(<Page />);
//   const decrementButton = getByText('Decrement');

//     fireEvent.click(decrementButton);

//     expect(getByText('Count: -1')).toBeInTheDocument();
// });
