const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes");

const app = express();
const port = process.env.PORT || 3000;

app.use("/", router);

app.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}/`);
});