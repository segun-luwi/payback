const models = require("../database/models");
import Joi from 'joi';
import config from '../config';
import responses from '../utils/responses';

export const totalUsers = async (req, res) => {
  const schema = Joi.object().keys({
    period: Joi.string().required()
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  try {
    // check period then get users and put them according to the days or weeks or months
    const { period } = req.body;
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
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 30);
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }
    const users = await models.User.findAll({
      where: {
        createdAt: {
          [sequelize.Op.between]: [startDate, endDate],
        },
      },
    });
    return res.status(200).json(responses.success(
      'Total users',
      users,
    ));
  } catch (error) {
    return res.status(500).json(responses.error(
      error.message,
    ));
  }
}

export const userSignIns = async (req, res) => {
  try {
    const users = await models.User.count({
      where: {
        lastLogin: {
          [sequelize.Op.not]: null,
        },
      },
    });
    return res.status(200).json(responses.success(
      'Total users',
      users,
    ));
  } catch (error) {
    return res.status(500).json(responses.error(
      error.message,
    ));
  }
}

export const userSignUps = async (req, res) => {
  try {
    const users = await models.User.count({
      where: {
        lastLogin: null,
      },
    });
    return res.status(200).json(responses.success(
      'Total users',
      users,
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
          [sequelize.Op.between]: [startDate, endDate],
        },
      },
    });
    return res.status(200).json(responses.success(
      'Total receipts',
      receipts,
    ));
  } catch (error) {
    return res.status(500).json(responses.error(
      error.message,
    ));
  }
}