const models = require("../database/models");
import Joi from 'joi';
import config from '../config';
import responses from '../utils/responses';
import fs, { unlink } from 'fs';
import axios from 'axios';
import AWS from 'aws-sdk';
import { off } from 'process';

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
  var tmp_name = req.file? req.file.filename : null;
  // console.log(tmp_name, 'tmp_name');
  // console.log(tmp_path, 'tmp_path');
  if(!tmp_path) {
    return res.status(400).json(responses.error(
      'Please upload an image',
    ));
  }

  const s3 = new AWS.S3({
    accessKeyId: config.amazon_s3_access_key_id,
    secretAccessKey: config.amazon_s3_access_secret,
  })

  const blob = fs.readFileSync(tmp_path);
  try {
    const uploadedImage = await s3.upload({
      Bucket: config.amazon_s3_bucket,
      Key: tmp_name,
      Body: blob,
      ACL:'public-read',
    }).promise()
    // console.log(uploadedImage.Location, 'uploadedImage');
    try {
      unlink(tmp_path, (err) => {
        if (err) {
          console.log(err, 'err');
        }
      });
    } catch (error) {
      console.log(error, 'error');
    }
    const taggun = 'https://api.taggun.io/api/receipt/v1/simple/url';
    const taggunApiKey = config.taggun;
    const jsonData = {
      'url': uploadedImage.Location,
      "headers": {
        "x-custom-key": "string"
      },
      'refresh': false,
      'incognito': false,
      'extractTime': false,
    }
    await axios.post(taggun, jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': taggunApiKey,
      }
    })
    .then(async (response) => {
      try {
        await s3.deleteObject({
          Bucket: config.amazon_s3_bucket,
          Key: tmp_name,
        }).promise()
      } catch (error) {
        console.log(error, 'error');
      }

      const total = response.data.totalAmount.data || 0;
      if(total === 0) {
        return res.status(400).json(responses.error(
          'No total amount found',
        ));
      }
      const divided =  Math.round(total / 1000);
      let userPoints = 5;
      if((divided > 0)){
        userPoints = divided * 10;
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
          { points:  parseInt(pointExist.points) + userPoints},
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
      req.body.points = userPoints;
      const point = await models.Point.create(req.body);
      return res.status(201).json(responses.success(
        'Point added successfully',
        point,
      ));
    })
    .catch(async (error) => {
      console.log(error, 'error');
      try {
        await s3.deleteObject({
          Bucket: config.amazon_s3_bucket,
          Key: tmp_name,
        }).promise()
      } catch (error) {
        console.log(error, 'error');
      }
      return res.status(400).json(responses.error(
        'Error extracting text from image',
      ));
    }
    );
  } catch (error) {
    console.log(error, 'error');
    try {
      unlink(tmp_path, (err) => {
        if (err) {
          console.log(err, 'err');
        }
      });
    } catch (error) {
      console.log(error, 'error');
    }
    return res.status(400).json(responses.error(
      'Error processing image',
    ));
  }
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