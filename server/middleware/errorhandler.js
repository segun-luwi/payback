import responses from '../utils/responses';


export const notFound = (req, res, next) => {
   res.status(404).json(responses.error(404, "Page not found"));
  next();
};

export const errorHandler = (error, req, res) => {
 res.status(404).json(responses.error(404, {
  message: error.message,
  error: process.env.NODE_ENV === 'production' ? {} : error.stack,
}));
};
