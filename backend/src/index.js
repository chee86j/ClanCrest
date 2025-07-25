const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('ClanCrest backend running on port 5000');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 