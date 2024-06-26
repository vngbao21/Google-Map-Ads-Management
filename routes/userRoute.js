const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const cloudinary = require("../cloudImage/cloudinary");
const multer = require('multer');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "demo-node-js-youtube",
        format: "jpg",
    },
});

const upload = multer({storage: storage});

router.get('/', controller.showMap);

router.post('/reports',upload.array("images", 2), controller.addReport); 
router.post('/boardID', controller.handleBoardIDPost);
router.post('/locationAny', controller.handlelocationAnyPost);
router.post('/findSDT', controller.findBC);



router.get('/billboards/:locationID', controller.getBillboards);
router.get('/getlocationAny/:queryID', controller.getLocationAny);
router.get('/getlocation/:queryID', controller.getLocation);
router.get('/BC/:queryID', controller.getBC);
router.get('/locations', controller.getLocations);
router.get('/report', controller.showReport);





    
module.exports = router;