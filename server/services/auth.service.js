import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;
import config from '../config';

const signToken = (data) => {
  // data = data.toObject();
  return sign(data, config.jwtSecret, { expiresIn: '1d' });
}

const verifyToken = (token) => {
  let response;
  try {
    response = verify(token, config.jwtSecret);
  } catch (err) {
    return null;
  }
  return response;
}
export default signToken;
export { verifyToken };