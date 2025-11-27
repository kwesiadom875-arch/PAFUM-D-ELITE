import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import InventoryTab from './InventoryTab';

// Mock dependencies
vi.mock('axios');
vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock LoadingSkeleton to avoid issues with it
vi.mock('../LoadingSkeleton', () => ({
    CardSkeleton: () => <div data-testid="loading-skeleton">Loading...</div>
}));

describe('InventoryTab', () => {
    const mockProducts = [
        { _id: '1', name: 'Perfume A', price: 100, stockQuantity: 5, image: 'img1.jpg' },
        { _id: '2', name: 'Perfume B', price: 200, stockQuantity: 10, image: 'img2.jpg' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        axios.get.mockResolvedValue({ data: mockProducts });
    });

    it('renders inventory form and product list', async () => {
        render(<InventoryTab />);

        // Check for form inputs
        expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Price (GH₵)')).toBeInTheDocument();

        // Check for product list (after loading)
        await waitFor(() => {
            expect(screen.getByText('Perfume A')).toBeInTheDocument();
            expect(screen.getByText('Perfume B')).toBeInTheDocument();
        });
    });

    it('validates required fields on submit', async () => {
        render(<InventoryTab />);

        const submitBtn = screen.getByRole('button', { name: /save to inventory/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            // Check for validation error messages (assuming they are displayed or toast is called)
            // The component calls toast.error("Please fix the form errors")
            // And also sets formErrors state which might display text
            // Let's check for the toast first as it's easier if we mocked it
            // But wait, the component renders error messages in spans too.
            // Let's check for "Product name is required" if it's in the DOM
            // Based on code: {formErrors.name && <span ...>{formErrors.name}</span>}
            expect(screen.getByText('Product name is required')).toBeInTheDocument();
        });
    });

    it('handles product creation successfully', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        render(<InventoryTab />);

        // Fill form
        fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'New Perfume' } });
        fireEvent.change(screen.getByPlaceholderText('Price (GH₵)'), { target: { value: '150' } });
        fireEvent.change(screen.getByPlaceholderText('Category (e.g. Woody)'), { target: { value: 'Fresh' } });
        fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'A fresh scent' } });
        fireEvent.change(screen.getByPlaceholderText('Image URL'), { target: { value: 'http://img.com/1.jpg' } });
        fireEvent.change(screen.getByPlaceholderText('Initial Stock'), { target: { value: '20' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /save to inventory/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/products'), expect.objectContaining({
                name: 'New Perfume',
                price: '150'
            }));
        });
    });

    it('handles delete interaction', async () => {
        // Mock window.confirm
        const confirmSpy = vi.spyOn(window, 'confirm');
        confirmSpy.mockImplementation(() => true);

        axios.delete.mockResolvedValueOnce({ data: { success: true } });

        render(<InventoryTab />);

        await waitFor(() => {
            expect(screen.getByText('Perfume A')).toBeInTheDocument();
        });

        // Find delete button for first item
        const deleteBtns = screen.getAllByText('Delete');
        fireEvent.click(deleteBtns[0]);

        expect(confirmSpy).toHaveBeenCalled();

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/api/products/1'));
        });

        confirmSpy.mockRestore();
    });
});
