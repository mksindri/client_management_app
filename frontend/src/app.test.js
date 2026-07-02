import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import App from './app';

test('renders CMS heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/CMS/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders Add Client button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Add Client/i);
  expect(buttonElement).toBeInTheDocument();
});
