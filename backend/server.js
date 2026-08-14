const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const products = [
  { id: 1, name: "MacBook Pro M3", price: 1999 },
  { id: 2, name: "Casque Sony WH-1000XM5", price: 349 },
  { id: 3, name: "Clavier Mécanique RGB", price: 129 }
];

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
