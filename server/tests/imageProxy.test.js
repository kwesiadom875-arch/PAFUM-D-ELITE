const request = require('supertest');
const app = require('../app');
const fetch = require('node-fetch');

jest.mock('node-fetch');

describe('Image Proxy API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if no URL is provided', async () => {
        const res = await request(app).get('/proxy-image');
        expect(res.statusCode).toEqual(400);
        expect(res.text).toBe('No URL provided');
    });

    it('should return 400 if URL protocol is invalid', async () => {
        const res = await request(app).get('/proxy-image?url=ftp://fimgs.net/image.jpg');
        expect(res.statusCode).toEqual(400);
        expect(res.text).toBe('Invalid protocol');
    });

    it('should return 403 if domain is not allowed', async () => {
        const res = await request(app).get('/proxy-image?url=https://example.com/image.jpg');
        expect(res.statusCode).toEqual(403);
        expect(res.text).toBe('Forbidden domain');
    });

    it('should return 403 if subdomain is not allowed', async () => {
        const res = await request(app).get('/proxy-image?url=https://evil.fimgs.net.evil.com/image.jpg');
        expect(res.statusCode).toEqual(403);
        expect(res.text).toBe('Forbidden domain');
    });

    it('should allow valid subdomains', async () => {
        const mockResponse = {
            ok: true,
            headers: {
                get: jest.fn().mockReturnValue('image/jpeg'),
            },
            body: {
                pipe: jest.fn((res) => res.end('image content')),
            },
        };
        fetch.mockResolvedValue(mockResponse);

        const res = await request(app).get('/proxy-image?url=https://sub.fragrantica.com/image.jpg');
        expect(res.statusCode).toEqual(200);
        expect(res.headers['content-type']).toBe('image/jpeg');
    });

    it('should proxy the image if domain is allowed', async () => {
        const mockResponse = {
            ok: true,
            headers: {
                get: jest.fn().mockReturnValue('image/jpeg'),
            },
            body: {
                pipe: jest.fn((res) => res.end('image content')),
            },
        };
        fetch.mockResolvedValue(mockResponse);

        const res = await request(app).get('/proxy-image?url=https://fimgs.net/image.jpg');
        expect(res.statusCode).toEqual(200);
        expect(res.headers['content-type']).toBe('image/jpeg');
    });

    it('should return 400 if content type is not an image', async () => {
        const mockResponse = {
            ok: true,
            headers: {
                get: jest.fn().mockReturnValue('text/html'),
            },
        };
        fetch.mockResolvedValue(mockResponse);

        const res = await request(app).get('/proxy-image?url=https://fimgs.net/not-an-image');
        expect(res.statusCode).toEqual(400);
        expect(res.text).toBe('URL does not point to an image');
    });

    it('should return upstream error status if fetch fails', async () => {
        const mockResponse = {
            ok: false,
            status: 404,
            statusText: 'Not Found',
        };
        fetch.mockResolvedValue(mockResponse);

        const res = await request(app).get('/proxy-image?url=https://fimgs.net/missing.jpg');
        expect(res.statusCode).toEqual(404);
        expect(res.text).toContain('Failed to fetch image: Not Found');
    });

    it('should handle fetch errors (network error)', async () => {
        fetch.mockRejectedValue(new Error('Fetch failed'));

        const res = await request(app).get('/proxy-image?url=https://fimgs.net/error.jpg');
        expect(res.statusCode).toEqual(500);
        expect(res.text).toBe('Failed to proxy image');
    });

    it('should handle invalid URL format', async () => {
         const res = await request(app).get('/proxy-image?url=not-a-url');
         expect(res.statusCode).toBe(400);
         expect(res.text).toBe('Invalid URL format');
    });
});
