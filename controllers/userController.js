const Report = require('../models/report');
const Billboard = require('../models/billboard');
const Location = require('../models/location');
const LocatioAny = require('../models/locationAny');

const cloudinary = require("../cloudImage/cloudinary");
const axios = require('axios');


const controller = {};
let currentBoardID = '';

const getNewReportID = async () => {
    
    try {
      
        // Đếm số lượng tài liệu trong collection "report"
        const reportCount = await Report.countDocuments();

        console.log(`Số lượng tài liệu trong collection "report" của nhom10 là: ${reportCount}`);
    
        // Nếu không có dữ liệu, gán reportID = r01
        if (reportCount == 0) {
            return "r01";
        }
  
        // Nếu có dữ liệu, lấy reportID mới nhất, tăng giá trị và sử dụng nó
        const latestReport = await Report.findOne({}, { reportID: 1 })
        .sort({ reportID: -1 })
        .limit(1);
        console.log(`ReportID last là: ${latestReport}`);

    
        const latestReportID = latestReport.reportID;
        const latestNumber = parseInt(latestReportID.slice(1)); // Lấy phần số từ reportID
        const newNumber = latestNumber + 1;
        const newReportID = "r" + newNumber.toString().padStart(2, "0"); // Tạo reportID mới
    
        return newReportID;
    } catch (error) {
        console.error(error);
        throw error;
    } 
};

const findMaxNumericQueryID = async () => {
    try {
      const result = await Report.aggregate([
        {
          $match: {
            queryID: { $regex: /^\d+$/ } // Lọc các documents có queryID là số
          }
        },
        {
          $group: {
            _id: null,
            maxQueryID: { $max: '$queryID' } // Tìm queryID lớn nhất
          }
        }
      ]);
  
      if (result.length > 0) {
        const maxQueryID = result[0].maxQueryID;
        const nextNumericQueryID = (parseInt(maxQueryID) + 1).toString();
        return nextNumericQueryID;
      } else {
        // Không có document nào có queryID là số
        return '1'; // Trường hợp đặc biệt nếu không có document nào
      }
    } catch (error) {
      console.error('Error finding max numeric queryID:', error);
      throw error;
    }
  };

controller.showMap = (req, res) => {
    res.render('Map', {
        layout: 'Map-layout',
    });
};

controller.showReport = (req, res) => {
    res.render('Report', {
        layout: 'Report-layout',
    });
};

controller.handleBoardIDPost = async (req, res) => {
    try {
        const boardID = req.body.boardID; 
        if (!boardID) {
            throw new Error('Missing boardID');
        }

        currentBoardID = boardID;
        console.log(currentBoardID);

        res.redirect('/report');
    } catch (error) {
        console.error('Error handling boardID:', error);
        res.status(400).json({ success: false, message: 'Error handling boardID', error: error.message });
    }
};

controller.handlelocationAnyPost = async (req, res) => {
    try {
        console.log(req.body);
        const nameAny = req.body.nameAny; 
        const diachiAny = req.body.diachiAny; 
        const locationAnyID = await findMaxNumericQueryID();

        await LocatioAny.create({
            locationAnyID,
            nameAny,
            diachiAny,
        });

        res.redirect('/report');
    } catch (error) {
        console.error('Error handling:', error);
        res.status(400).json({ success: false, message: 'Error handling', error: error.message });
    }
};

controller.addReport = async (req, res) => {

    console.log(req.body);
    console.log(req.files);

    //let { reportType, fullName, email, phone, reportContent, image1, image2} = req.body;
    var reportType = req.body.reportType;
    var fullName = req.body.fullName;
    var email = req.body.email;
    var phone = req.body.phone;
    var reportContent = req.body.reportContent;
    var queryID = '';
    if (currentBoardID == '') {
        queryID = await findMaxNumericQueryID();
    }
    else{
        queryID = currentBoardID;
    }
    
    const reportID = await getNewReportID(); // Lấy reportID mới
    
    const recaptcha = req.body['g-recaptcha-response'];
    if(!recaptcha) {
        res.redirect('/report?alertErr=Vui lòng xác nhận bạn không phải robot.');
        //return res.json({success: false, msg: 'Captcha token is underfined!'});
    }
    else{
        const YOUR_SECRET_KEY = '6LelokcpAAAAAFKFE7EuwzzYtQi9vYtT77Vogx7l';
        const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${YOUR_SECRET_KEY}&response=${recaptcha}`;
        
        try {
            console.log('Đường dẫn xác minh:', verificationURL);
            const recaptchaVerification = await axios.post(verificationURL);
            console.log('Phản hồi reCaptcha:', recaptchaVerification.data);
            if(recaptchaVerification.data.success){
                try {

                    const images = req.files.map((file) => file.path);
            
                    const uploadedImages = [];
            
                    for(let image of images) {
                        const results = await cloudinary.uploader.upload(image);
                        uploadedImages.push({
                            url: results.secure_url,
                            publicId: results.secure_id,
                        });
                    }
            
                    const image1 = uploadedImages[0] ? uploadedImages[0].url : null;
                    const image2 = uploadedImages[1] ? uploadedImages[1].url : null;
                    
                    await Report.create({
                        reportID,
                        reportType,
                        fullName,
                        email,
                        phone,
                        reportContent,
                        thoidiemgui: new Date(),
                        tinhtrang: "Chưa xử lí",
                        cachthucxuly: 'null',
                        queryID,
                        image1,
                        image2
                    });
            
                    res.redirect('/?alertOK=Đã gửi báo cáo thành công.');
                    
                    //res.redirect('/');
                    
                } catch (error) {
                    res.send("Can not add report!");
                    console.error(error);
                } 
            }
            else{
                res.status(403).send('Failed reCaptcha verification');
            }
        }
        catch(error){
            console.error('Error verifying reCaptcha:', error);
            res.status(500).send('Internal server error');
        }
    }

};


controller.getLocations = async (req, res) => {
    try {
        // Lấy tất cả các bảng locations
        const locations = await Location.find({});
        res.json(locations); 
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
    }
};

controller.getBillboards = async (req, res) => {
    try {
        const locationID = req.params.locationID;

        const billboardData = await Billboard.find({ locationID });


        res.json(billboardData);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        res.status(500).send('Lỗi Nội Bộ của Máy Chủ');
    }
};
  
controller.getBC = async (req, res) => {
    try {
        const queryID = req.params.queryID;

        const reportData = await Report.find({ queryID });

        if (!reportData || reportData.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu cho queryID đã cung cấp.' });
        }

        res.json(reportData);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        res.status(500).send('Lỗi Nội Bộ của Máy Chủ');
    }
};

  module.exports = controller;
