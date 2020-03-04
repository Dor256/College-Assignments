import express from 'express';
import path from 'path';

const PORT = process.env.PORT || 3000;

const app = express();

const publicPath = path.join(path.dirname(__dirname), 'public');
app.use(express.static(publicPath));

app.get('/nyc', (req, res) => {
    res.sendFile(`${publicPath}/nyc.html`);
});

app.get('/', (req, res) => {
    res.sendFile(`${publicPath}/index.html`);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});