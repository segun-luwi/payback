import { Router } from 'express';
import addPoints from '../controllers/point.controller';
import multer from 'multer';

const router = Router();
// const upload = multer({ dest: 'uploads/' });
// multer check if image exist
// multer check if image size is less than 10mb

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // store in base directory
    cb(null, __dirname);
    // cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    /** generate a unique name for the image. **/
  const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
  // get the file extension
  const extension = file.originalname.split('.').pop();
  // generate the new file name
  const fileName = `${uniqueName}.${extension}`;
    cb(null, fileName);
  },
});
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: fileFilter,
});

router.post('/add', upload.single('image'), addPoints);

export default router;