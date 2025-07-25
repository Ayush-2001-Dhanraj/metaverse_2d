import { router } from "./routes/v1";

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use('/api/v1', router);

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});