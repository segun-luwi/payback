const models = require("../database/models");
import Joi from 'joi';
import config from '../config';
import responses from '../utils/responses';
import fs from 'fs';

const addPoints = async (req, res) => {
  // get store from form data
  const store = req.body.store;
  if(!store) {
    return res.status(400).json(responses.error(
      'Please add the store',
    ));
  }
  // check image upload validation
  var tmp_path = req.file? req.file.path : null;
  // console.log(tmp_path, 'tmp_path');
  if(!tmp_path) {
    return res.status(400).json(responses.error(
      'Please upload an image',
    ));
  }

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
      { points:  parseInt(pointExist.points) + 50},
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
      'Point updated successfully',
      point,
    ));
  }
  req.body.userId = req.user.id;
  req.body.points = 50;
  const point = await models.Point.create(req.body);
  return res.status(201).json(responses.success(
    'Point added successfully',
    point,
  ));
};

export const getPoints = async (req, res) => {
  const points = await models.Point.findAll({
    where: {
      userId: req.user.id,
    },
  });
  return res.status(200).json(responses.success(
    'Points retrieved successfully',
    points,
  ));
};
export default addPoints;