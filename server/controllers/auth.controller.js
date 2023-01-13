const models = require("../database/models");
import signToken from '../services/auth.service.js';
import bcrypt from 'bcrypt';
import Joi from 'joi';
import sendMail from '../services/email.service';
import config from '../config';
import responses from '../utils/responses';
import { response } from 'express';
const { Op } = require("sequelize");

const register = async (req, res) => {
  const schema = Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    lga: Joi.string().required(),
    state: Joi.string().required(),
    age: Joi.string().required(),
    maritalStatus: Joi.string().required(),
    gender: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(responses.error(
      error.details[0].message,
    ));
  }
  const { password } = req.body;

  req.body.password = bcrypt.hashSync(password, 10);

  req.body.roleId = 4;
  try {
    // check if user email or username already exists
    const userExist = await models.User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (userExist) {
      return res.status(400).json(responses.error(
        'User email already exists'
      ));
    }
    const usernameExist = await models.User.findOne({
      where: {
        username: req.body.username,
      },
    });
    if (usernameExist) {
      return res.status(400).json(responses.error(
        'Username already exists'
      ));
    }
    const user = await models.User.create(req.body);

    sendMail(user.dataValues.email,
      `Verify your email address`,
      `<p style="text-align: center">Thank you for signing up to Payback</p>
      <p>In order to get the most out of your account, it is important that you verify your email address by clicking the button below:</p>
      <p style="text-align:center"><a href="${config.frontendUrl}/verify-email/?email=${req.body.email}" 
      style="text-decoration: none; color: white; padding: 3px; 
      background-color: #4E7AC7">Verify your email</a> </p>
      `
    );
    return res.status(201).json({
      message: 'success',
      user
    });
  } catch (error) {
    return res.status(500).json({
      message: 'failed',
      error: error.message,
    });
  }
}

export const login = async (req, res) => {
  const schema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const {username, password} = req.body;
  // check if username exist
  const userCheck = await models.User.findOne({
    where: { username: username },
    include: [
      {
        model: models.Point,
        as: 'points',
      }],
  });

  if(!userCheck  || !userCheck.dataValues) {
    return res.status(400).json({
      message: 'Username does not exist',
    });
  }
  const user = userCheck.dataValues;
  // check if password is correct
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if(!isPasswordCorrect) {
    return res.status(400).json({
      message: 'Password is incorrect',
    });
  }
  const token = signToken(user);
  // add user sign in to UserSignIn table for today if it doesn't exist
  const today = new Date();
  const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const userSignIn = await models.UserSignIn.findOne({
    where: {
      userId: user.id,
      date: {
        [Op.between]: [startDate, endDate]
      },
    },
  });
  if(!userSignIn) {
    await models.UserSignIn.create({
      userId: user.id,
      date: date,
    });
  }
  res.status(200).json({ token, user });
}

export const adminLogin = async (req, res) => {
  const schema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const {username, password} = req.body;
  // check if username exist
  const userCheck = await models.Admin.findOne({
    where: { username: username },
  });

  if(!userCheck  || !userCheck.dataValues) {
    return res.status(400).json({
      message: 'Username does not exist',
    });
  }
  const user = userCheck.dataValues;
  // check if password is correct
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if(!isPasswordCorrect) {
    return res.status(400).json({
      message: 'Password is incorrect',
    });
  }
  const token = signToken(user);
  res.status(200).json({ token, user });
}

export const verification = async (req, res) => {
  try {
    if(!req.body.email) {
      return res.status(400).json(responses.error(
        'Email is required'
      ));
    }
    // check if email exists
    const user = await models.User.findOne({
      where: { email: req.body.email }
    });
    if(!user) {
      return res.status(400).json(responses.error(
        'Email does not exist'
      ));
    }
    // set user status to verified
    await models.User.update({
      status: 'verified',
    }, {
      where: { email: req.body.email }
    });

    sendMail(req.body.email,
      `Email verified`,
      `<p style="text-align: center">Congratulations! Your account is now verified</p>
      <p style="text-align:center"><a href="${config.frontendUrl}" 
      style="text-decoration: none; color: white; padding: 3px; 
      background-color: #4E7AC7">Get started</a></p>
      `
    );
    return res.status(200).json({
      message: 'success',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'failed',
      error: error.message,
    });
  }
}
export default  register;