require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const middlewares = require('./middlewares.js');
const router = require('./router.js');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

middlewares(app);

app.get('/', (_, res) => {
    res.status(200).send('Oh My Cash v1.0.0');
});

router(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
