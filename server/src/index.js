import express from 'express';
import 'dotenv/config'
import userRoutes from './routes/userRoutes.js'
import choreRoutes from './routes/choreRoutes.js'
import cors from 'cors';
import { verifyToken } from './middlewares/validationMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);
app.use('/chore', choreRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});
