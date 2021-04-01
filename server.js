import express from 'express';
const app = express();
const port = 8080;

app.use(express.static('dist'));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
