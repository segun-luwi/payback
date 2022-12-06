import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import bodyParser from 'body-parser';
import { notFound } from './server/middleware/errorhandler';
import traceLogger from './server/logger/traceLogger';
import routes from './server/routes';
import config from './server/config';
import errorhandler from 'errorhandler';

// initialize express
const app = express();

// for request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(logger('dev'));

app.get('/', (req, res) => {
  res.json({ massage: 'Welcome to Payback API' });
});
app.use('/api/v1', routes);

app.use('*', notFound);
app.use(errorhandler());

process.on('unhandledRejection', (reason) => {
  traceLogger(reason);
});


process.on('uncaughtException', (reason) => {
  traceLogger(reason);
});

const PORT = process.env.PORT || 9877;
app.listen(PORT, () => {
  process.stdout.write(`app is listening on port ${PORT}`);
});


export default app;
