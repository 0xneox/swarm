import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { validateInput } from './validation';
import { detectFraud } from './fraudDetection';

export const setupSecurity = (app) => {
    // Basic security headers
    app.use(helmet());

    // CORS configuration
    app.use(cors({
        origin: process.env.ALLOWED_ORIGINS.split(','),
        methods: ['GET', 'POST'],
        credentials: true
    }));

    // Rate limiting
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }));

    // Input validation middleware
    app.use(validateInput);

    // Fraud detection
    app.use(detectFraud);

    // Additional security measures
    app.use((req, res, next) => {
        // Remove sensitive headers
        res.removeHeader('X-Powered-By');
        
        // Add security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Content-Security-Policy', "default-src 'self'");
        
        next();
    });
};

// Input validation
export const validateInput = (req, res, next) => {
    try {
        // Validate request body
        if (req.body) {
            // Sanitize and validate input
            const sanitizedBody = sanitizeInput(req.body);
            req.body = sanitizedBody;
        }
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
};

// Fraud detection system
export const detectFraud = (req, res, next) => {
    try {
        const fraudScore = calculateFraudScore(req);
        if (fraudScore > FRAUD_THRESHOLD) {
            return res.status(403).json({ error: 'Suspicious activity detected' });
        }
        next();
    } catch (error) {
        next(error);
    }
};
