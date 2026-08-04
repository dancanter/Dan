import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SourceList } from '../../src/components/ui/SourceList';

describe('SourceList', () => {
  it('renders the organisation for a cited source', () => {
    render(<SourceList sourceIds={['nhs-vitamins']} />);
    expect(screen.getByText(/NHS/)).toBeInTheDocument();
  });

  it('surfaces a funding caveat alongside the citation', () => {
    render(<SourceList sourceIds={['razmpoosh-2025']} />);
    expect(screen.getByText(/National Dairy Council/i)).toBeInTheDocument();
  });

  it('renders nothing when there are no source ids', () => {
    const { container } = render(<SourceList sourceIds={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
