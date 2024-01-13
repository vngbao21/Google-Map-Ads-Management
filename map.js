const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const expressHbs = require("express-handlebars");
const session = require("express-session");



const app = express();
const PORT = 1000;

var userRoute = require('./routes/userRoute');

const MONGO_URL = 'mongodb://localhost:27017/nhom10'; // Đổi 'ten_database' thành tên bạn muốn

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

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use('/Dan', express.static(path.join(__dirname, 'Dan')));

// Cau hinh Template Engine
app.engine(
  "hbs",
  expressHbs.engine({
    layoutsDir: __dirname + "/views/layouts",
    defaultLayout: "Map-layout",
    extname: "hbs",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
    },
  })
);
app.set("view engine", "hbs");

// Cau hinh cho phep doc du lieu gui len bang phuong thuc POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ debug: true }));

app.use (express.static('uploads'));

app.use('/', userRoute);


// Lắng nghe cổng 3000
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
