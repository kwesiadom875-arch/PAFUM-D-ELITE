const fetch = require('node-fetch');

// Allowlist of domains (subdomains included via check)
const ALLOWED_DOMAINS = [
    'fimgs.net',
    'fragrantica.com'
];

exports.proxyImage = async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('No URL provided');
    }

    try {
        const parsedUrl = new URL(url);

        // validate protocol
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return res.status(400).send('Invalid protocol');
        }

        // validate domain
        const hostname = parsedUrl.hostname;
        const isAllowed = ALLOWED_DOMAINS.some(domain =>
            hostname === domain || hostname.endsWith(`.${domain}`)
        );

        if (!isAllowed) {
            return res.status(403).send('Forbidden domain');
        }

        const response = await fetch(url);

        if (!response.ok) {
            // Forward the status from the upstream server if possible, or 502 Bad Gateway
            return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            return res.status(400).send('URL does not point to an image');
        }

        res.setHeader('Content-Type', contentType);
        response.body.pipe(res);

    } catch (error) {
        console.error('Error proxying image:', error);
        // Distinguish between invalid URL format and fetch errors
        if (error.code === 'ERR_INVALID_URL') {
             return res.status(400).send('Invalid URL format');
        }
        res.status(500).send('Failed to proxy image');
    }
};
