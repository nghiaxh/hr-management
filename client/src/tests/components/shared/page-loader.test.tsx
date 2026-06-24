import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PageLoader } from '@/components/shared/page-loader';

describe('PageLoader', () => {
  it('renders skeleton elements', () => {
    const { container } = render(<PageLoader />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
