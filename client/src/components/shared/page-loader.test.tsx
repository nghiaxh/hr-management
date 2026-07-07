import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PageLoader } from './page-loader';

describe('PageLoader', () => {
  it('renders without crashing', () => {
    const { container } = render(<PageLoader />);
    expect(container.firstChild).toBeTruthy();
  });
});
