const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.json({ status: "success", message: "API SmartTask Backend Operationnelle !" });
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
