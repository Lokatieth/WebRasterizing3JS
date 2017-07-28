const express = require('express');
const app = express();

app.use( express.static( './Player/Vincent' ) );

app.get('/', function (req, res) {
  res.send('Hello !');
})

app.get('/Vincent', function (req, res) {
  res.render('./Player/Vincent/template.html');
})

app.listen(8080, function () {
  console.log('Serveur en route sur port:8080');
})
