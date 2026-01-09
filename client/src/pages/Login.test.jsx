import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import { CartContext } from '../context/CartContext';

// Mock dependencies
vi.mock('axios');
vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Login', () => {
    const mockLogin = vi.fn();

    const renderLogin = () => {
        return render(
            <MemoryRouter>
                <CartContext.Provider value={{ login: mockLogin }}>
                    <Login />
                </CartContext.Provider>
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        renderLogin();
        expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('updates input values on change', () => {
        renderLogin();
        const emailInput = screen.getByPlaceholderText('Email Address');
        const passwordInput = screen.getByPlaceholderText('Password');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('handles successful login', async () => {
        const mockUser = { id: '1', name: 'Test User', tier: 'Gold' };
        const mockToken = 'fake-token';

        axios.post.mockResolvedValueOnce({
            data: { user: mockUser, token: mockToken }
        });

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        // Check loading state
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByText('Authenticating...')).toBeInTheDocument();

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith(mockUser, mockToken);
            expect(mockNavigate).toHaveBeenCalledWith('/profile');
        });
    });

    it('handles login failure', async () => {
        const errorMessage = 'Invalid credentials';
        axios.post.mockRejectedValueOnce({
            response: { data: { message: errorMessage }, status: 401 }
        });

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });
    });
});
