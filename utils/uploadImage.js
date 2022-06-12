const multer = require('multer');
const path = require('path');

// var storage = new GridFsStorage({
//     url: process.env.DATABASE,
//     options: { useNewUrlParser: true, useUnifiedTopology: true },
//     file: (req, file) => {
//       const match = ["image/png", "image/jpeg"];
  
//       if (match.indexOf(file.mimetype) === -1) {
//         const filename = `${Date.now()}-bezkoder-${file.originalname}`;
//         return filename;
//       }
  
//       return {
//         bucketName: "photos",
//         filename: `${Date.now()}-bezkoder-${file.originalname}`
//       };
//     }
//   });
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/images');
      },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const uploadImage = multer({storage: storage}).single('file');

module.exports = uploadImage;
