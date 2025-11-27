import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from './ProductCard';

// Mock GSAP to avoid animation errors in tests
vi.mock('gsap', () => ({
    default: {
        to: vi.fn(),
        fromTo: vi.fn(),
        timeline: () => ({
            to: vi.fn().mockReturnThis(),
            fromTo: vi.fn().mockReturnThis(),
        }),
    },
}));

describe('ProductCard', () => {
    const mockProduct = {
        _id: '123',
        name: 'Test Perfume',
        price: 100,
        image: 'test.jpg',
        category: 'Niche',
        stockQuantity: 10,
        sizes: []
    };

    const mockAddToCart = vi.fn();
    const mockOnQuickView = vi.fn();

    const renderCard = (props = {}) => {
        return render(
            <MemoryRouter>
                <ProductCard
                    product={mockProduct}
                    addToCart={mockAddToCart}
                    onQuickView={mockOnQuickView}
                    {...props}
                />
            </MemoryRouter>
        );
    };

    it('renders product details correctly', () => {
        renderCard();
        expect(screen.getByText('Test Perfume')).toBeInTheDocument();
        expect(screen.getByText('Niche')).toBeInTheDocument();
    });

    it('shows "Out of Stock" badge when stock is 0', () => {
        const outOfStockProduct = { ...mockProduct, stockQuantity: 0 };
        const { container } = renderCard({ product: outOfStockProduct });

        // Check for the badge specifically
        const badge = container.querySelector('.badge-out');
        expect(badge).toHaveTextContent('Out of Stock');

        // Or check that the text exists at least once
        expect(screen.getAllByText('Out of Stock').length).toBeGreaterThan(0);
    });

    it('calls addToCart when button is clicked', () => {
        renderCard();
        // The button text might be inside the AddToCartButton component
        // Assuming AddToCartButton renders a button
        const btn = screen.getByRole('button', { name: /add to cart/i });
        fireEvent.click(btn);
        expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
    });

    it('calls onQuickView when eye icon is clicked', () => {
        renderCard();
        // The eye icon button usually has a class or we can find by role if it has aria-label
        // Since we don't have aria-label on the button in the code I read, I'll rely on the class or add aria-label in the component if needed.
        // But wait, the code has `className="quickview-btn"`.
        // Let's try to find by the icon or class. 
        // Best practice: add aria-label to the button in the component. 
        // For now, let's query by the button that contains the eye icon.
        // Or better, I can modify the component to add aria-label "Quick View".

        // For this test, I'll assume I can find it.
        // Let's use container.querySelector since we don't have a good accessible name yet.
        const { container } = renderCard();
        const quickViewBtn = container.querySelector('.quickview-btn');
        fireEvent.click(quickViewBtn);
        expect(mockOnQuickView).toHaveBeenCalledWith(mockProduct);
    });

    it('locks "Ultra Niche" product for Bronze user', () => {
        const ultraNicheProduct = { ...mockProduct, category: 'Ultra Niche' };
        const bronzeUser = { tier: 'Bronze' };

        renderCard({ product: ultraNicheProduct, user: bronzeUser });

        expect(screen.getByText('Exclusive to Diamond Members')).toBeInTheDocument();
        expect(screen.queryByText('Test Perfume')).not.toBeInTheDocument(); // Name should be blurred/replaced or hidden? 
        // Code says: <h3 className="card-name" style={{ filter: 'blur(4px)' }}>Exclusive Scent</h3>
        expect(screen.getByText('Exclusive Scent')).toBeInTheDocument();
    });

    it('unlocks "Ultra Niche" product for Diamond user', () => {
        const ultraNicheProduct = { ...mockProduct, category: 'Ultra Niche' };
        const diamondUser = { tier: 'Diamond' };

        renderCard({ product: ultraNicheProduct, user: diamondUser });

        expect(screen.queryByText('Exclusive to Diamond Members')).not.toBeInTheDocument();
        expect(screen.getByText('Test Perfume')).toBeInTheDocument();
    });
});
