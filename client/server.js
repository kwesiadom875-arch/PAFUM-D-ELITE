import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 5001;

app.use(cors());

app.get('/proxy-image', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer' // Important for images
        });

        const contentType = response.headers['content-type'];
        res.set('Content-Type', contentType);
        res.send(response.data);
    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).send('Error fetching image');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
