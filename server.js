require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');
const path = require('path');
const expressLayouts = require('express-ejs-layouts'); // thêm dòng này

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const supplierRoutes = require('./routes/suppliers');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

// Kết nối MongoDB
connectDB();

// view engine + layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);                // bật express-ejs-layouts
app.set('layout', 'layouts/main');      // layout mặc định

// middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 ngày
}));

// middleware để lấy user hiện tại
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId ? { id: req.session.userId, role: req.session.userRole } : null;
  next();
});

// routes
app.use('/auth', authRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/products', productRoutes);

app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// start server
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
