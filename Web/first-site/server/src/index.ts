import express from 'express';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static('dist/build'));

app.get('/', (req, res) => {
    res.sendFile(`index.html`);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});