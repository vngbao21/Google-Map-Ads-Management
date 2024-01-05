const express = require('express');
const path = require('path');
const mongoose = require("mongoose");


const app = express();
const PORT = 3000;

var userRoute = require('./routes/userRoute');

const MONGO_URL = 'mongodb+srv://nhom10:web21ktpm@cluster0.uveminn.mongodb.net/nhom10?retryWrites=true&w=majority'

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(MONGO_URL, options)
  .then(() => {
    console.log('MongoDB is connected');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });


app.use((req, res, next) => {
  // Đặt tiêu đề cache-control
  res.setHeader('Cache-Control', 'Dan, max-age=604800, stale-while-revalidate=604800');

  // Đặt tiêu đề x-content-type-options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Tiếp tục đến middleware tiếp theo
  next();
});

// Dùng middleware để phục vụ tệp tĩnh (ví dụ: HTML, CSS, hình ảnh)
app.use(express.static(path.join(__dirname, 'Dan')));

// Route chính
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Dan', 'Map.html'));
});

// Cau hinh cho phep doc du lieu gui len bang phuong thuc POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ debug: true }));

app.use (express.static('uploads'));

app.use('/', userRoute);


// Lắng nghe cổng 3000
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
