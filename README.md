# Parfum D'Elite

Parfum D'Elite is a luxury e-commerce platform designed to offer an immersive and sophisticated fragrance shopping experience. It combines high-end aesthetics with cutting-edge technology, featuring AI-powered consultations, 3D product showcases, and real-time delivery tracking.

## Features

- **Immersive 3D Product Showcase**: View products in high-fidelity 3D with dynamic lighting and material effects.
- **AI Luxury Negotiator**: Interact with "Josie," our AI Scent Sommelier, for personalized recommendations and price negotiations.
- **Scent Finder**: An AI-driven search tool that understands natural language queries to find your perfect scent.
- **Climate Tests**: Detailed analysis of how fragrances perform in different climates (specifically tailored for Accra, Ghana).
- **Real-Time Delivery Tracking**: Track your order in real-time with live driver location updates on an interactive map.
- **Comparison Tray**: Compare multiple perfumes side-by-side to make informed decisions.
- **Wishlist & Reviews**: Save your favorites and share your experiences.
- **Secure Payments**: Integrated with Paystack for secure and seamless transactions.
- **Admin Dashboard**: Comprehensive management of products, orders, and climate tests.

## Tech Stack

### Client

- **Framework**: React (Vite)
- **Styling**: CSS Modules, Framer Motion, GSAP (GreenSock Animation Platform)
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Maps**: React Leaflet, Google Maps API

### Server

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Authentication**: JWT, Argon2
- **AI**: Groq SDK (Llama 3.3 70b)
- **Email**: Nodemailer
- **Web Scraping**: Cheerio, Puppeteer

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

## Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd parfum
    ```

2.  **Install Server Dependencies**

    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies**
    ```bash
    cd ../client
    npm install
    ```

## Configuration

### Server Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/parfum_delite
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
FRONTEND_URL=http://localhost:5173
```

### Client Environment Variables

Create a `.env` file in the `client` directory (optional, defaults are set in config):

```env
VITE_API_URL=http://localhost:5000
```

## Usage

1.  **Start the Server**

    ```bash
    cd server
    npm start
    ```

    The server will run on `http://localhost:5000`.

2.  **Start the Client**

    ```bash
    cd client
    npm run dev
    ```

    The client will run on `http://localhost:5173`.

3.  **Access the Application**
    Open your browser and navigate to `http://localhost:5173`.

## API Documentation

The backend provides a RESTful API for the frontend. Key endpoints include:

- `GET /api/products`: Fetch all products
- `POST /api/auth/login`: User login
- `POST /api/auth/signup`: User registration
- `POST /api/ai/chat`: Interact with the AI Sommelier
- `POST /api/negotiation/offer`: Submit a price offer
- `GET /api/climate-tests`: Retrieve climate test data

## Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
