import express from 'express';
import path from 'path';

const PORT = process.env.PORT || 3000;

const app = express();

const publicPath = path.join(path.dirname(__dirname), 'public');
app.use(express.static(publicPath));

app.get('/nyc', (req, res) => {
    res.sendFile(`${publicPath}/nyc.html`);
});

app.get('/angelus', (req, res) => {
    res.sendFile(`${publicPath}/angelus.html`);
});

app.get('/doom', (req, res) => {
    res.sendFile(`${publicPath}/doom.html`);
});

app.get('/milford', (req, res) => {
    res.sendFile(`${publicPath}/milford.html`);
});

app.get('/ir', (req, res) => {
    res.sendFile(`${publicPath}/glendalough.html`);
});

app.get('/', (req, res) => {
    res.sendFile(`${publicPath}/index.html`);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
