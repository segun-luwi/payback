const models = require("../database/models");
import Joi from 'joi';
import config from '../config';
import responses from '../utils/responses';
const { Op } = require("sequelize");

// get total users and sort them by state using the optional date range
export const totalUsers = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let users;
    if(startDate && endDate) {
      users = await models.User.findAll({
        attributes: [
          'state',
          [models.sequelize.fn('COUNT', models.sequelize.col('state')), 'total'],
        ],
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: ['state'],
      });
    } else {
      users = await models.User.findAll({
        attributes: [
          'state',
          [models.sequelize.fn('COUNT', models.sequelize.col('state')), 'total'],
        ],
        group: ['state'],
      });
    }
    // count total users
    const total = users.reduce((acc, user) => {
      return acc + parseInt(user.dataValues.total);
    }, 0);
    // get users count up to the end of last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth());
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);
    console.log(lastMonth);
    const lastMonthUsers = await models.User.count({
      where: {
        createdAt: {
          [Op.lt]: lastMonth,
        },
      },
    });
    const data = {
      users,
      total,
      lastMonthUsers,
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

export const totalUsersByLocation = async (req, res) => {
  try {
    const { startDate, endDate, state } = req.query;
    let users;
    const whereData = {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    };
    if(state) {
      whereData.state = state;
    }
    if(startDate && endDate) {
      users = await models.User.findAll({
        attributes: [
          'state',
          [models.sequelize.fn('COUNT', models.sequelize.col('state')), 'total'],
        ],
        where: whereData,
        group: ['state'],
      });
    } else {
      users = await models.User.findAll({
        attributes: [
          'state',
          [models.sequelize.fn('COUNT', models.sequelize.col('state')), 'total'],
        ],
        group: ['state'],
      });
    }
    // count total users
    const total = users.reduce((acc, user) => {
      return acc + parseInt(user.dataValues.total);
    }, 0);
    // get users count up to the end of last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth());
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);
    const whereLastMonthData = {
      createdAt: {
        [Op.lt]: lastMonth,
      }
    };
    if(state) {
      whereLastMonthData.state = state;
    }
    const lastMonthUsers = await models.User.count({
      where: whereLastMonthData,
    });
    const data = {
      users,
      total,
      lastMonthUsers,
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

export const totalUsersByGender = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let users;
    let genders;
    const whereData = {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    };
    const totalUsers = await models.User.count();
    const totalUserMale = await models.User.count({
        where: {
          gender: 'male'
        }
    });
    const totalUserFemale = await models.User.count({
        where: {
          gender: 'female'
        }
    });
    if(startDate && endDate) {
      // get total number of genders by states
      users = await models.User.findAll({
        attributes: [
          'state',
          [models.sequelize.fn('COUNT', models.sequelize.col('state')), 'total'],
        ],
        where: whereData,
        group: ['state'],
      });
      
      // map for each state and get the total number based on the gender
      genders = await Promise.all(users.map(async (user) => {
        const state = user.dataValues.state;
        const totalMales = await models.User.count({
          where: {
            state,
            createdAt: {
              [Op.between]: [startDate, endDate],
            },
            gender: 'male'
          },
        });
        const totalFemales = await models.User.count({
          where: {
            state,
            createdAt: {
              [Op.between]: [startDate, endDate],
            },
            gender: 'female'
          },
        });
        return {
          state,
          totalMales,
          totalFemales,
          total: user.dataValues.total,
        }
      }));
    } else {
      users = await models.User.findAll({
        attributes: [
          'state',
          [models.sequelize.fn('COUNT', models.sequelize.col('state')), 'total'],
        ],
        group: ['state'],
      });
      
      // map for each state and get the total number based on the gender
      genders = await Promise.all(users.map(async (user) => {
        const state = user.dataValues.state;
        const totalMales = await models.User.count({
          where: {
            state,
            gender: 'male'
          },
        });
        const totalFemales = await models.User.count({
          where: {
            state,
            gender: 'female'
          },
        });
        return {
          state,
          totalMales,
          totalFemales,
          total: user.dataValues.total,
        }
      }));
    }
    const data = {
      states: genders,
      totalUsers,
      totalUserMale,
      totalUserFemale,
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

export const totalUsersByAge = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let ages;
    const whereData = {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    };
    const totalUsers = await models.User.count();
    if(startDate && endDate) {
      ages = await models.User.findAll({
        attributes: [
          'age',
          [models.sequelize.fn('COUNT', models.sequelize.col('age')), 'total'],
        ],
        where: whereData,
        group: ['age'],
      });
    } else {
      ages = await models.User.findAll({
        attributes: [
          'age',
          [models.sequelize.fn('COUNT', models.sequelize.col('age')), 'total'],
        ],
        group: ['age'],
      });
    }
    // get users count up to the end of last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth());
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);
    const whereLastMonthData = {
      createdAt: {
        [Op.lt]: lastMonth,
      }
    };
    const lastMonthUsers = await models.User.count({
      where: whereLastMonthData,
    });
    const data = {
      ages,
      totalUsers,
      lastMonthUsers
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
  try {
    const { startDate, endDate } = req.query;
    const date = new Date();
    let users;
    if(startDate && endDate) {
      users = await models.UserSignIn.count({
        where: {
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
    } else {
      users = await models.UserSignIn.count();
    }
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

export const scanReceipts = async (req, res) => {
  try {
    // check check if its daily, weekly or monthly
    const { startDate, endDate } = req.query;
    let receipts;
    if(startDate & endDate) {
      receipts = await models.Receipt.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
    } else {
      receipts = await models.Receipt.count();
    }
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