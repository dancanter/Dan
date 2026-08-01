import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SourceList } from '../../src/components/content/SourceList';

describe('SourceList', () => {
  it('renders the organisation for each cited source', () => {
    render(<SourceList sourceIds={['nhs-vitamins-supplements-pregnancy']} />);
    expect(screen.getByText(/NHS/)).toBeInTheDocument();
  });

  it('renders nothing when there are no source ids', () => {
    const { container } = render(<SourceList sourceIds={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
