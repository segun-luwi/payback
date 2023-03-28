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
  const purchaseLocation = req.body.purchaseLocation  || 'N/A';
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
 
  // const files = [req.file];
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
  // console.log(result)
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
  // if(data.duplicate == true) {
  //   return res.status(400).json(responses.error(
  //     'This receipt has already been submitted',
  //   ));
  // }


  const job = await models.Job.create({
    userId: req.user.id,
    token: data.token,
    code: data.code,
    duplicate: data.duplicate,
    store: store,
    purchaseLocation,
    status: 'pending',
  });
  let pointExist = await models.Point.findOne({
    where: {
      store: store,
      userId: req.user.id,
    },
  });
  const today = new Date();
  const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  if (!pointExist) {
    pointExist = {
      store: store,
      userId: req.user.id,
      points: 10,
      // add created at and updated at for today
      createdAt: date,
      updatedAt: date
    }
  }
  // call getResult function to get result
  let jobResult;
  await getResult(job.id).then((result) => {
    jobResult = result || 0;
    return res.status(200).json(responses.success(
      'Receipt submitted successfully',
      {
        store: store,
        userId: req.user.id,
        points: jobResult, 
        createdAt: date,
        updatedAt: date
      },
    ));
  }).catch((error) => {
    console.log(error, 'error');
    return res.status(400).json(responses.error(
      'Error getting result',
    ));
  });
}

export const getResult = async (jobId = null) => {
  // added for immediate points execution
  let pointR = 0;

  // const jobs = await models.Job.findAll({
  //   where: {
  //     status: 'pending',
  //   },
  // });
  const jobGotten = await models.Job.findOne({
    where: {
      status: 'pending',
      id: jobId,
    },
  });
  let job;
  if(jobGotten) {
    job = jobGotten.dataValues;
  }
  // if(jobs.length > 0) {
  //   await jobs.map (async (job) => {
  //     const options = {
  //       method: 'GET',
  //       uri: `https://api.tabscanner.com/api/result/${job.token}`,
  //       headers: {
  //         'apikey': API_KEY
  //       }
  //     };
  //     const result = await rp(options)
  //     const data = JSON.parse(result);
  //     if(data.code !== 202) {
  //       return;
  //     }
  //     await models.Job.update(
  //       { status:  'completed'},
  //       { where: { token: job.token } },
  //     );
  //     const total = data.result.total || 0;
  //     // get total of all qty of items in data.result.lineItems
  //     let totalQty = 0;
  //     try {
  //       totalQty = data.result.lineItems.reduce((acc, item) => {
  //         return acc + item.qty;
  //       }, 0);
  //     } catch (error) {
  //       console.log(error, 'error');
  //     }
  //     let receiptData = {
  //       userId: job.userId,
  //       amount: total,
  //       points: 0,
  //       store: job.store,
  //       purchaseLocation: job.purchaseLocation,
  //       qty: totalQty,
  //     };
  //     let receiptId = 0;
  //     if(total === 0) {
  //       const receiptInfo = await models.Receipt.create(receiptData);
  //       receiptId = receiptInfo.id;
  //     }
      
  //     const divided =  Math.round(total / 1000);
  //     let userPoints = 5;
  //     if((divided > 0)){
  //       userPoints = divided * 10;
  //     } else if  (total >= 500) {
  //       userPoints = 10;
  //     }
  //     receiptData.points = userPoints;
  //     if(total > 0) {
  //       const receiptInfo = await models.Receipt.create(receiptData);
  //       receiptId = receiptInfo.id;
  //     }
  //     try {
  //       await Promise.all(data.result.lineItems.map(async (item) => {
  //         // check if item.descClean contains Local Sales
  //         const itemDesc = item.descClean.toLowerCase()
  //         if(itemDesc.includes('local sales') || itemDesc.includes('tax') || itemDesc.includes('total') || itemDesc.includes('subtotal') || itemDesc.includes('invoice')) {
  //           return;
  //         }
  //         // award 10 points for each 1000 in lineTotal
  //         const divided =  Math.round(item.lineTotal / 1000);
  //         let points = 5;
  //         if((divided > 0)){
  //           points = divided * 10;
  //         } else if  (item.lineTotal >= 500) {
  //           points = 10;
  //         } else if (item.lineTotal == 0) {
  //           points = 0;
  //         }
          
  //         await models.Brand.create({
  //           receiptId,
  //           brandName: item.descClean,
  //           qty: item.qty,
  //           amount: item.lineTotal,
  //           points,
  //         });
  //       }));
  //     } catch (error) {
  //       console.log(error, 'error');
  //     }

  //     // check if user has a store with points
  //     const pointExist = await models.Point.findOne({
  //       where: {
  //         store: job.store,
  //         userId: job.userId,
  //       },
  //     });
  //     if (pointExist) {
  //       // add points to the one in the database
  //       await models.Point.update(
  //         { points:  parseInt(pointExist.points) + userPoints},
  //         { where: { store: job.store, userId: job.userId } },
  //       );
  //     } else {
  //       // create a new point
  //       await models.Point.create({
  //         userId: job.userId,
  //         store: job.store,
  //         points: userPoints,
  //       });
  //     }
  //   });
  // }

  if(job) {
    // delay for 4 seconds
    const options = {
      method: 'GET',
      uri: `https://api.tabscanner.com/api/result/${job.token}`,
      headers: {
        'apikey': API_KEY
      }
    };
    const result = await rp(options)
    const data = JSON.parse(result);
    if(data.code !== 202 && data.code !== 200) {
      return;
    }
    await models.Job.update(
      { status:  'completed'},
      { where: { id: job.id } },
    );
    const total = data.result.total || 0;
    // get total of all qty of items in data.result.lineItems
    let totalQty = 0;
    try {
      totalQty = data.result.lineItems.reduce((acc, item) => {
        return acc + item.qty;
      }, 0);
    } catch (error) {
      console.log(error, 'error');
    }
    let receiptData = {
      userId: job.userId,
      amount: total,
      points: 0,
      store: job.store,
      purchaseLocation: job.purchaseLocation,
      qty: totalQty,
    };
    let receiptId = 0;
    if(total === 0) {
      const receiptInfo = await models.Receipt.create(receiptData);
      receiptId = receiptInfo.id;
    }
    
    const divided =  Math.round(total / 1000);
    let userPoints = 5;
    if((divided > 0)){
      userPoints = divided * 10;
    } else if  (total >= 500) {
      userPoints = 10;
    }
    receiptData.points = userPoints;
    if(total > 0) {
      const receiptInfo = await models.Receipt.create(receiptData);
      receiptId = receiptInfo.id;
    }
    try {
      await Promise.all(data.result.lineItems.map(async (item) => {
        // check if item.descClean contains Local Sales
        const itemDesc = item.descClean.toLowerCase()
        if(itemDesc.includes('local sales') || itemDesc.includes('tax') || itemDesc.includes('total') || itemDesc.includes('subtotal') || itemDesc.includes('invoice')) {
          return;
        }
        // award 10 points for each 1000 in lineTotal
        const divided =  Math.round(item.lineTotal / 1000);
        let points = 5;
        if((divided > 0)){
          points = divided * 10;
        } else if  (item.lineTotal >= 500) {
          points = 10;
        } else if (item.lineTotal == 0) {
          points = 0;
        }
        
        await models.Brand.create({
          receiptId,
          brandName: item.descClean,
          qty: item.qty,
          amount: item.lineTotal,
          points,
        });
      }));
    } catch (error) {
      console.log(error, 'error');
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
    pointR = userPoints;
    return pointR;
  } else {
    return pointR;
  }
}

export const getPoints = async (req, res) => {
  const points = await models.Point.findAll({
    where: {
      userId: req.user.id,
    },
  });
  let totalPoints = 0;
  try {
    totalPoints = points.reduce((acc, item) => {
      return acc + item.points;
    }, 0);
  } catch (error) {
    console.log(error, 'error');
  }
  // get receipts sorted by descending order
  const receipts = await models.Receipt.findAll({
    where: {
      userId: req.user.id,
    },
    order: [
      ['createdAt', 'DESC'],
    ],
  });
  const data = {
    stores: points,
    points: receipts,
    totalPoints,
  }
  return res.status(200).json(responses.success(
    'Points retrieved successfully',
    data,
  ));
};
export default addPoints;