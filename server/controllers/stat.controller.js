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
    let usersData;
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
      usersData = await models.User.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
    } else {
      users = await models.User.findAll({
        attributes: [
          'state',
          [models.sequelize.fn('COUNT', models.sequelize.col('state')), 'total'],
        ],
        group: ['state'],
      });
      usersData = await models.User.findAll();
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
      usersData,
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
    let totalUsers = await models.User.count();
    let totalUserMale = await models.User.count({
        where: {
          gender: 'male'
        }
    });
    let totalUserFemale = await models.User.count({
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
      totalUsers = await models.User.count({
        where: whereData,
      });
      totalUserMale = await models.User.count({
        where: {
          ...whereData,
          gender: 'male'
        }
      });
      totalUserFemale = await models.User.count({
        where: {
          ...whereData,
          gender: 'female'
        }
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
    let totalUsers = await models.User.count();
    if(startDate && endDate) {
      ages = await models.User.findAll({
        attributes: [
          'age',
          [models.sequelize.fn('COUNT', models.sequelize.col('age')), 'total'],
        ],
        where: whereData,
        group: ['age'],
      });
      totalUsers = await models.User.count({
        where: whereData,
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
    if(startDate && endDate) {
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

export const totalPurchaseByLocation = async (req, res) => {
  //Check where the purchase Location is
  let neighbourhoodstore = 0;
  let openMarket = 0;
  let ecommerce = 0;
  let supermarket = 0;
  // get the total number of receipts from the database then map through it
  const receipts = await models.Receipt.findAll();
  receipts.map((receipt) => {
    if (receipt.purchaseLocation === "neighbourhoodstore") {
      neighbourhoodstore++;
    } else if (receipt.purchaseLocation === "openMarket") {
      openMarket++;
    } else if (receipt.purchaseLocation === "ecommerce") {
      ecommerce++;
    } else if (receipt.purchaseLocation === "supermarket") {
      supermarket++;
    }
  });
  const total = neighbourhoodstore + openMarket + ecommerce + supermarket;
  const data = {
    neighbourhoodstore,
    openMarket,
    ecommerce,
    supermarket,
    total,
  };
  return res.status(200).json(responses.success("Total purchase locations", data));
};

export const totalPurchasedByBrand = async (req, res) => {
  // get all the receipts from the database receipt model check each brand that is not null and count the number of times they appear
  const receipts = await models.Brand.findAll();
  const brands = receipts.map((receipt) => receipt.brandName);
  const brandCount = {};
  brands.forEach((brand) => {
    if (brandCount[brand]) {
      brandCount[brand]++;
    } else {
      brandCount[brand] = 1;
    }
  }
  );
  const data = {
    brands: brandCount,
    totalBrands: Object.keys(brandCount).length,
    total: brands.length,
  };
  return res.status(200).json(responses.success("Total brands", data));
};

export const totalQuantityPurchasedByState = async (req, res) => {
  // get all the receipts from the database receipt model check each state that is not null and count the number of times they appear
  const getUsers = await models.User.findAll();
  let stateList = {};
  await Promise.all(getUsers.map(async (user) => {
    // get the total sum of quantities from the receipt model that matches the user id
    const receipts = await models.Receipt.findAll({
      where: {
        userId: user.id,
      },
    });
    // use reduce to get the total sum of quantities
    const quantities = receipts.reduce((acc, receipt) => {
      if (receipt.qty != null) {
        return acc + receipt.qty;
      } else {
        return acc;
      }
    }, 0);
    // push the state and the total sum of quantities to the stateList array, if the state already exists, add the quantities to the existing state
    if (stateList[user.state]) {
      stateList[user.state] += quantities;
    } else {
      stateList[user.state] = quantities;
    }
  }));
  
  const data = {
    stateList,
    totalStates: Object.keys(stateList).length,
    total: Object.values(stateList).reduce((acc, val) => acc + val, 0),
  };
  return res.status(200).json(responses.success("Total quantities", data));
}