import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ShopFilters from './ShopFilters';

describe('ShopFilters', () => {
    const categories = ['All', 'Niche', 'Designer'];
    const mockOnFilterChange = vi.fn();

    it('renders all categories', () => {
        render(
            <ShopFilters
                categories={categories}
                activeFilter="All"
                onFilterChange={mockOnFilterChange}
            />
        );

        categories.forEach(cat => {
            expect(screen.getByText(cat)).toBeInTheDocument();
        });
    });

    it('applies active class to the selected filter', () => {
        render(
            <ShopFilters
                categories={categories}
                activeFilter="Niche"
                onFilterChange={mockOnFilterChange}
            />
        );

        const activeBtn = screen.getByText('Niche');
        const inactiveBtn = screen.getByText('Designer');

        expect(activeBtn).toHaveClass('active');
        expect(inactiveBtn).not.toHaveClass('active');
    });

    it('calls onFilterChange when a category is clicked', () => {
        render(
            <ShopFilters
                categories={categories}
                activeFilter="All"
                onFilterChange={mockOnFilterChange}
            />
        );

        const designerBtn = screen.getByText('Designer');
        fireEvent.click(designerBtn);

        expect(mockOnFilterChange).toHaveBeenCalledWith('Designer');
    });
});
