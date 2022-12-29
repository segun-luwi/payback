const models = require("../database/models");
import Joi from 'joi';
import config from '../config';
import responses from '../utils/responses';

export const  generatePins = async (req, res) => {
  // check tht the user role is 1
  const userRole = req.user.roleId;
  if(userRole !== 1) {
    return res.status(401).json(responses.error(
      'You are not authorized to perform this action',
    ));
  }
  // use the number of pins passed to generate 12 digit pins using an algorithm and check if the pins already exists in the database
  // if it exists, generate another pin
  // if it doesn't exist, save the pin to the database
  // return the pins generated

  const schema = Joi.object({
    number: Joi.number().required(),
    points: Joi.number().required(),
  });
  const { error } = schema.validate(req.body);
  if(error) {
    return res.status(400).json(responses.error(
      error.details[0].message,
    ));
  }
  const { number, points } = req.body;
  const pins = [];
  for (let i = 0; i < number; i++) {
    const pin = Math.floor(Math.random() * 1000000000000);
    const pinExists = await models.Pin.findOne({
      where: {
        pin: pin.toString(),
      }
    });
    if(pinExists) {
      i--;
    } else {
      pins.push(pin);
    }
  }
  const pinData = pins.map(pin => {
    return {
      pin,
      status: 'unused',
      points,
    }
  }
  );
  await models.Pin.bulkCreate(pinData);
  return res.status(201).json(responses.success(
    'Pins generated successfully',
    pins,
  ));
};

export const addPoints = async (req, res) => {
  // verify pin, confirm it has not been used and then update the pins table with the userId, store, date and status then add points to the user and if the store doesn't exist create one
  // return the points added
  const schema = Joi.object({
    pin: Joi.number().required(),
    store: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if(error) {
    return res.status(400).json(responses.error(
      error.details[0].message,
    ));
  }
  const { pin, store } = req.body;
  const pinExist = await models.Pin.findOne({
    where: {
      pin,
    },
  });
  if(!pinExist) {
    return res.status(400).json(responses.error(
      'Pin does not exist',
    ));
  }
  if(pinExist.status === 'used') {
    return res.status(400).json(responses.error(
      'Pin has been used',
    ));
  }
  const pinData = {
    userId: req.user.id,
    store,
    status: 'used',
    dateUsed: new Date(),
  };
  await models.Pin.update(pinData, {
    where: {
      pin,
    },
  });
  // check if user has a store with points
  const pointExist = await models.Point.findOne({
    where: {
      store: store,
      userId: req.user.id,
    },
  });
  if (pointExist) {
    // add points to the one in the database
    let point = await models.Point.update(
      { points:  parseInt(pointExist.points) + pinExist.points},
      { where: { store: store, userId: req.user.id } },
    );
    //get updated point
    point = await models.Point.findOne({
      where: {
        store: store,
        userId: req.user.id,
      },
    });
    return res.status(200).json(responses.success(
      'Points updated successfully',
      point,
    ));
  }
  // create a new store with points
  const point = await models.Point.create({
    userId: req.user.id,
    store,
    points: pinExist.points,
  });
  return res.status(201).json(responses.success(
    'Points added successfully',
    point,
  ));
};