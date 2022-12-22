const models = require("../database/models");
import Joi from 'joi';
import config from '../config';
import responses from '../utils/responses';
const { Op } = require("sequelize");

export const totalUsers = async (req, res) => {
  try {
    const users = await models.User.count();
    const data = {
      total : users
    }
    return res.status(200).json(responses.success(
      'Total users',
      data,
    ));
  } catch (error) {
    return res.status(500).json(responses.error(
      error.message,
    ));
  }
}

export const userSignIns = async (req, res) => {
  const schema = Joi.object().keys({
    period: Joi.string().required()
  });
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  try {
    const { period } = req.query;
    const date = new Date();
    let startDate;
    let endDate;
    if(period === 'daily') {
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    } else if(period === 'weekly') {
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    } else if(period === 'monthly') {
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    } else {
      return res.status(400).json(responses.error(
        'Period is invalid'
      ));
    }
    const users = await models.UserSignIn.count({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
    const data = {
      total: users,
    }
    return res.status(200).json(responses.success(
      'Total users signed in',
      data,
    ));
  } catch (error) {
    return res.status(500).json(responses.error(
      error.message,
    ));
  }
}

export const userSignUps = async (req, res) => {
  const schema = Joi.object().keys({
    period: Joi.string().required()
  });
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  try {
    const { period } = req.query;
    const date = new Date();
    let startDate;
    let endDate;
    if(period === 'daily') {
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    } else if(period === 'weekly') {
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    } else if(period === 'monthly') {
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    } else {
      return res.status(400).json(responses.error(
        'Period is invalid'
      ));
    }
    const users = await models.User.count({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
    const data = {
      total: users,
    }
    return res.status(200).json(responses.success(
      'Total users',
      data,
    ));
  } catch (error) {
    return res.status(500).json(responses.error(
      error.message,
    ));
  }
}

export const scanReceipts = async (req, res) => {
  try {
    // check check if its daily, weekly or monthly
    const { period } = req.query;
    if(!period) {
      return res.status(400).json(responses.error(
        'Period is required'
      ));
    }
    const date = new Date();
    let startDate;
    let endDate;
    if(period === 'daily') {
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    } else if(period === 'weekly') {
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    } else if(period === 'monthly') {
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    } else {
      return res.status(400).json(responses.error(
        'Period is invalid'
      ));
    }
    const receipts = await models.Receipt.count({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
    const data = {
      total: receipts,
    }
    return res.status(200).json(responses.success(
      'Total receipts',
      data,
    ));
  } catch (error) {
    return res.status(500).json(responses.error(
      error.message,
    ));
  }
}