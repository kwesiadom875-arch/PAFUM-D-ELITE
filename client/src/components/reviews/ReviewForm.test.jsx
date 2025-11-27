import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import ReviewForm from './ReviewForm';

// Mock dependencies
vi.mock('axios');
vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ReviewForm', () => {
    const mockOnSubmit = vi.fn();
    const productId = '123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form elements', () => {
        render(<ReviewForm productId={productId} onReviewSubmitted={mockOnSubmit} />);

        expect(screen.getByText('Write a Review')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Share your thoughts on this scent...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit review/i })).toBeInTheDocument();
    });

    it('validates empty comment', async () => {
        render(<ReviewForm productId={productId} onReviewSubmitted={mockOnSubmit} />);

        const submitBtn = screen.getByRole('button', { name: /submit review/i });
        fireEvent.click(submitBtn);

        // Should not call axios
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('submits review successfully', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        render(<ReviewForm productId={productId} onReviewSubmitted={mockOnSubmit} />);

        // Fill comment
        fireEvent.change(screen.getByPlaceholderText('Share your thoughts on this scent...'), { target: { value: 'Great scent!' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/reviews'), expect.objectContaining({
                productId: '123',
                rating: 5, // Default rating
                comment: 'Great scent!'
            }), expect.any(Object));

            expect(mockOnSubmit).toHaveBeenCalled();
        });
    });

    it('handles submission error', async () => {
        axios.post.mockRejectedValueOnce({ response: { data: { message: 'Error' } } });
        render(<ReviewForm productId={productId} onReviewSubmitted={mockOnSubmit} />);

        fireEvent.change(screen.getByPlaceholderText('Share your thoughts on this scent...'), { target: { value: 'Bad scent!' } });
        fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });
});
