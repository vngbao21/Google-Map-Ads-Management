const Report = require('../models/report');
const Billboard = require('../models/billboard');
const Location = require('../models/location');
const cloudinary = require("../cloudImage/cloudinary");



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

controller.handleBoardIDPost = async (req, res) => {
    try {
        const boardID = req.body.boardID; 
        if (!boardID) {
            throw new Error('Missing boardID');
        }

        currentBoardID = boardID;

        res.redirect('/Map.html');
    } catch (error) {
        console.error('Error handling boardID:', error);
        res.status(400).json({ success: false, message: 'Error handling boardID', error: error.message });
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
    
    const reportID = await getNewReportID(); // Lấy reportID mới
    
    
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
            queryID: currentBoardID,
            image1,
            image2
        });

    
        res.redirect('/Report.html');
        
    } catch (error) {
        res.send("Can not add report!");
        console.error(error);
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

        if (!billboardData || billboardData.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu cho locationID đã cung cấp.' });
        }

        res.json(billboardData);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        res.status(500).send('Lỗi Nội Bộ của Máy Chủ');
    }
};
  

  module.exports = controller;
