const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());
app.options('*', cors());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

const actorRouter = require('./Routers/actorRouter')();
app.use('/api', actorRouter);

app.server = app.listen(port, ()=>{
    console.log(`Running on port ${port}`);
});

module.exports = app;