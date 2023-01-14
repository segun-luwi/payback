const models = require("../database/models");
import Joi from 'joi';
import config from '../config';
import responses from '../utils/responses';
import fs, { unlink } from 'fs';
import axios from 'axios';
import AWS from 'aws-sdk';
const API_KEY = config.tab_scanner;
const rp = require("request-promise");

const addPoints = async (req, res) => {
  // get store from form data
  const store = req.body.store;
  if(!store) {
    return res.status(400).json(responses.error(
      'Please add the store',
    ));
  }
  // // check image upload validation
  // // var tmp_path = req.file? req.file.path : null;
  var tmp_name = req.file? req.file.filename : null;
  // var tmp_path = "http://" +
  // req.get("host") +
  // "/uploads/" + tmp_name;
  var tmp_path = `${__dirname}/${tmp_name}`;
  // // console.log(tmp_name, 'tmp_name');
  // console.log(tmp_path, 'tmp_path');
  // if(!tmp_path) {
  //   return res.status(400).json(responses.error(
  //     'Please upload an image',
  //   ));
  // }

  // const s3 = new AWS.S3({
  //   accessKeyId: config.amazon_s3_access_key_id,
  //   secretAccessKey: config.amazon_s3_access_secret,
  // })

  // const blob = fs.readFileSync(tmp_path);
  // console.log(blob, 'blob');
  // try {
  //   const uploadedImage = await s3.upload({
  //     Bucket: config.amazon_s3_bucket,
  //     Key: tmp_name,
  //     Body: blob,
  //     ACL:'public-read',
  //   }).promise()
  //   // console.log(uploadedImage.Location, 'uploadedImage');
  
  //   const taggun = 'https://api.taggun.io/api/receipt/v1/simple/url';
  //   const taggunApiKey = config.taggun;
  //   const jsonData = {
  //     'url': uploadedImage.Location,
  //     "headers": {
  //       "x-custom-key": "string"
  //     },
  //     'refresh': false,
  //     'incognito': false,
  //     'extractTime': false,
  //   }
  //   await axios.post(taggun, jsonData, {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'apikey': taggunApiKey,
  //     }
  //   })
  //   .then(async (response) => {
  //     try {
  //       await s3.deleteObject({
  //         Bucket: config.amazon_s3_bucket,
  //         Key: tmp_name,
  //       }).promise()
  //     } catch (error) {
  //       console.log(error, 'error');
  //     }

        // return res.status(200).json(responses.success(
  //         'Points updated successfully',
  //         point,
  //       ));
  //     }
  //     req.body.userId = req.user.id;
  //     req.body.points = userPoints;
  //     return res.status(201).json(responses.success(
  //       'Points added successfully',
  //       point,
  //     ));
  //   })
  //   .catch(async (error) => {
  //     console.log(error, 'error');
  //     try {
  //       await s3.deleteObject({
  //         Bucket: config.amazon_s3_bucket,
  //         Key: tmp_name,
  //       }).promise()
  //     } catch (error) {
  //       console.log(error, 'error');
  //     }
  //     return res.status(400).json(responses.error(
  //       'Error extracting text from image',
  //     ));
  //   }
  //   );
  // } catch (error) {
  //   console.log(error, 'error');
  //   try {
  //     unlink(tmp_path, (err) => {
  //       if (err) {
  //         console.log(err, 'err');
  //       }
  //     });
  //   } catch (error) {
  //     console.log(error, 'error');
  //   }
  //   return res.status(400).json(responses.error(
  //     'Error processing image',
  //   ));
  // }
  const files = [req.file];
  const params = {};
  let formData = {
    file: []
  }
  
  formData.file.push({
    value: fs.createReadStream(tmp_path),
    options: {
      filename: tmp_name.filename,
      contentType: 'image/jpg'
    }
  })
  
  formData = Object.assign({}, formData, params);
  const options = {
    method: 'POST',
    formData: formData,
    uri: `https://api.tabscanner.com/api/2/process`,
    headers: {
      'apikey': API_KEY
    }
  };

  const result = await rp(options)
  console.log(result)
  try {
    unlink(tmp_path, (err) => {
      if (err) {
        console.log(err, 'err');
      }
    });
  } catch (error) {
    console.log(error, 'error');
  }
  const data = JSON.parse(result);
  if(data.code !== 200) {
    return res.status(400).json(responses.error(
      'Error extracting text from image',
    ));
  }
  if(data.duplicate == true) {
    return res.status(400).json(responses.error(
      'This receipt has already been submitted',
    ));
  }
  await models.Job.create({
    userId: req.user.id,
    token: data.token,
    code: data.code,
    duplicate: data.duplicate,
    store: store,
    status: 'pending',
  });
  let pointExist = await models.Point.findOne({
    where: {
      store: store,
      userId: req.user.id,
    },
  });
  if (!pointExist) {
    pointExist = {
      id: 4,
      store: store,
      userId: req.user.id,
      points: 10,
      createdAt: "2022-12-22T09:44:42.429Z",
      updatedAt: "2023-01-13T14:50:23.452Z"
    }
  }
  return res.status(200).json(responses.success(
    'Receipt submitted successfully',
    pointExist,
  ));
};

export const getResult = async () => {
  const jobs = await models.Job.findAll({
    where: {
      status: 'pending',
    },
  });
  
  if(jobs.length > 0) {
    await jobs.map (async (job) => {
      const options = {
        method: 'GET',
        uri: `https://api.tabscanner.com/api/result/${job.token}`,
        headers: {
          'apikey': API_KEY
        }
      };
      const result = await rp(options)
      const data = JSON.parse(result);
      if(data.code !== 202) {
        return;
      }
      await models.Job.update(
        { status:  'completed'},
        { where: { token: job.token } },
      );
      const total = data.result.total || 0;
      let receiptData = {
        userId: job.userId,
        amount: total,
        points: 0,
      };
      if(total === 0) {
        await models.Receipt.create(receiptData);
      }
      const divided =  Math.round(total / 1000);
      let userPoints = 5;
      if((divided > 0)){
        userPoints = divided * 10;
      }
      receiptData.points = userPoints;
      if(total > 0) {
        await models.Receipt.create(receiptData);
      }
      // check if user has a store with points
      const pointExist = await models.Point.findOne({
        where: {
          store: job.store,
          userId: job.userId,
        },
      });
      if (pointExist) {
        // add points to the one in the database
        await models.Point.update(
          { points:  parseInt(pointExist.points) + userPoints},
          { where: { store: job.store, userId: job.userId } },
        );
      } else {
        // create a new point
        await models.Point.create({
          userId: job.userId,
          store: job.store,
          points: userPoints,
        });
      }
    });
  }
}

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