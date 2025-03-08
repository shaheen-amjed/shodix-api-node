const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes, Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io for live messages
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your frontend origin
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allow these HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
}));

// Handle preflight requests for all routes
app.options('*', cors());

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  if (req.method === 'OPTIONS') {
    console.log('Preflight request detected');
  }
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'storeImg' ? './uploads/stores' : './uploads/products';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// JWT Secret
const JWT_SECRET = "shodixSecretKey2024";
// Initialize Sequelize with SQLite
const sequelize = new Sequelize('shodix_db', 'shodix', 'Qwe135poi246', {
  host: 'mysql-shodix.alwaysdata.net',
  dialect: 'mysql',
  logging: false, // Set to true to see SQL logs in the console
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to AlwaysData MySQL database!');
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
})();



// Define models and routes (keep your existing code here)...

// Sync database and start server


// Define models
const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  store_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  timestamps: false
});

const Store = sequelize.define('Store', {
  store_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  store_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  full_location: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  img: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: false
});

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  full_location: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: false
});

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  store_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  desc: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  img: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  timestamps: false
});

const Cart = sequelize.define('Cart', {
  cart_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  img: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  full_location: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  store_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false
});

const Chat = sequelize.define('Chat', {
  chat_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  store: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  timestamps: false
});

const Messages = sequelize.define('Messages', {
  msg_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chat_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Chat,
      key: 'chat_id'
    }
  },
  msg: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  full_location: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  store_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false
});

// Helper functions
const verifyToken = (req, res, next) => {
  let token;
  
  // Check if token is in cookies, headers, or request body
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.body && req.body.jwt) {
    token = req.body.jwt;
  }

  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

const isUser = async (req, res, next) => {
  if (!req.user || !req.user.user_id) {
    return res.status(403).json({ msg: 'Access denied. User authentication required.' });
  }
  
  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    req.userDetails = user;
    next();
  } catch (error) {
    return res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

const isStore = async (req, res, next) => {
  if (!req.user || !req.user.store_id) {
    return res.status(403).json({ msg: 'Access denied. Store authentication required.' });
  }
  
  try {
    const store = await Store.findByPk(req.user.store_id);
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    req.storeDetails = store;
    next();
  } catch (error) {
    return res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

const validateUsername = (username) => {
  const invalidChars = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", " ", "{", "}", "]", "/"];
  return !invalidChars.some(char => username.includes(char));
};

// Socket.io connection

// Routes
app.get('/', (req, res) => {
  res.json({ msg: 'I am running!' });
});

const verifyJWTshaheen = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ msg: "No token provided" });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(400).json({ msg: "Invalid JWT token!" });
        }
        req.user = decoded;
        next();
    });
};

// GET /api/msg/get/:store_and_:user
app.get('/api/msg/get/:store_and_:user', verifyJWTshaheen, async (req, res) => {
  const { store, user } = req.params;
  const { user_id, store_id } = req.user;

  try {
      let chat = await Chat.findOne({ where: { user, store } });

      if (!chat) {
          chat = await Chat.create({ user, store });
      }

      if ((user_id && user === chat.user) || (store_id && store === chat.store)) {
          const messages = await Messages.findAll({
              where: { chat_id: chat.chat_id },
              order: [['timestamp', 'ASC']],
          });
          return res.status(200).json(messages);  // msg_to_json() غير موجود، نعيد البيانات مباشرة
      } else {
          return res.status(403).json({ msg: "You are not authorized to see these messages" });
      }
  } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal server error" });
  }
});

// POST /api/msg/add/:store_and_:user
app.post('/api/msg/add/:store_and_:user', verifyJWTshaheen, async (req, res) => {
  const { store, user } = req.params;
  const { msg } = req.body;
  const { user_id, store_id } = req.user;

  try {
      if (!msg) {
          return res.status(400).json({ msg: "Message content is required" });
      }

      let chat = await Chat.findOne({ where: { user, store } });
      if (!chat) {
          chat = await Chat.create({ user, store });
      }

      if ((user_id && user === chat.user) || (store_id && store === chat.store)) {
          await Messages.create({ chat_id: chat.chat_id, msg, timestamp: new Date() });
          return res.status(201).json({ msg: "Sent successfully" });
      } else {
          return res.status(403).json({ msg: "You are not authorized to send messages" });
      }
  } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal server error" });
  }
});

// Cart routes
app.post('/api/cart', verifyToken, isUser, async (req, res) => {
  try {
    const username = req.user.username;
    
    const cart = await Cart.findAll({ where: { username } });
    
    if (!cart || cart.length === 0) {
      return res.status(404).json({ msg: 'No items found in your cart!' });
    }
    
    return res.json(cart.map(item => ({
      cart_id: item.cart_id,
      price: item.price,
      img: item.img,
      user_id: item.user_id,
      username: item.username,
      country: item.country,
      full_location: item.full_location,
      store_name: item.store_name,
      name: item.name,
      product_id: item.product_id,
      store_id: item.store_id,
      quantity: item.quantity
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

app.options('/api/cart', cors());

// Store registration
app.post('/api/store/reg', upload.single('storeImg'), async (req, res) => {
  try {
    const { store_name, password, full_location, bio } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ msg: 'Missing store image' });
    }
    
    if (!store_name) {
      return res.status(400).json({ msg: 'Missing store name' });
    }
    
    if (!password) {
      return res.status(400).json({ msg: 'Missing password' });
    }
    
    if (!full_location) {
      return res.status(400).json({ msg: 'Missing full location' });
    }
    
    if (!bio) {
      return res.status(400).json({ msg: 'Missing bio' });
    }
    
    if (!validateUsername(store_name)) {
      return res.status(400).json({ 
        msg: "You cannot use spaces or these chars '!@#$%^&*()' you can do it like this: MyStore or my_store" 
      });
    }
    
    const existingStore = await Store.findOne({ where: { store_name } });
    if (existingStore) {
      return res.status(409).json({ msg: 'Store name already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Save image path
    const imgPath = `/uploads/stores/${req.file.filename}`;
    
    // Create new store
    const newStore = await Store.create({
      store_name,
      password: hashedPassword,
      full_location,
      img: imgPath,
      bio
    });
    
    res.status(201).json({ msg: 'Store created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// User registration
app.post('/api/user/reg', async (req, res) => {
  try {
    const { username, password, full_location } = req.body;
    
    if (!username) {
      return res.status(400).json({ msg: 'Missing user name' });
    }
    
    if (!password) {
      return res.status(400).json({ msg: 'Missing password' });
    }
    
    if (!full_location) {
      return res.status(400).json({ msg: 'Missing full location' });
    }
    
    if (!validateUsername(username)) {
      return res.status(400).json({ 
        msg: "You cannot use spaces or these chars '!@#$%^&*()' you can do it like this: MyName or my_name" 
      });
    }
    
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ msg: 'User name already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      full_location
    });
    
    res.status(201).json({ msg: 'User created successfully! Please log in => <a href="/login">Click here</a>' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Store login
app.post('/api/store/log', async (req, res) => {
  try {
    const { store_name, password } = req.body;
    
    if (!store_name || !password) {
      return res.status(400).json({ msg: 'Incorrect store name or password' });
    }
    
    const store = await Store.findOne({ where: { store_name } });
    if (!store) {
      return res.status(400).json({ msg: 'Incorrect store name or password' });
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, store.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect store name or password' });
    }
    
    // Create JWT
    const token = jwt.sign({
      store_id: store.store_id,
      store_name: store.store_name,
      full_location: store.full_location
    }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// User login
app.post('/api/user/log', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ msg: 'Incorrect username or password' });
    }
    
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ msg: 'Incorrect username or password' });
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect username or password' });
    }
    console.log("Got a request")
    // Create JWT
    const token = jwt.sign({
      user_id: user.user_id,
      username: user.username,
      full_location: user.full_location
    }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Store update
app.patch('/api/store/update', verifyToken, isStore, upload.single('storeImg'), async (req, res) => {
  try {
    const { store_name, password, full_location, bio } = req.body;
    const store = req.storeDetails;
    
    // Check if store name is being changed and already exists
    if (store_name && store_name !== store.store_name) {
      if (!validateUsername(store_name)) {
        return res.status(400).json({ 
          msg: "You cannot use spaces or these chars '!@#$%^&*()' you can do it like this: MyStore or my_store" 
        });
      }
      
      const existingStore = await Store.findOne({ where: { store_name } });
      if (existingStore) {
        return res.status(409).json({ msg: 'Store name already exists' });
      }
    }
    
    // Update fields
    if (store_name) store.store_name = store_name;
    if (full_location) store.full_location = full_location;
    if (bio) store.bio = bio;
    
    // Update password if provided
    if (password) {
      store.password = await bcrypt.hash(password, 10);
    }
    
    // Update image if provided
    if (req.file) {
      // Delete old image if it exists
      if (store.img && store.img.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, store.img);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      store.img = `/uploads/stores/${req.file.filename}`;
    }
    
    await store.save();
    
    res.json({ msg: 'Updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Check if user is store owner
app.post('/api/is/owner', verifyToken, async (req, res) => {
  try {
    const { store_see } = req.body;
    
    if (req.user.store_id && req.user.store_name === store_see) {
      return res.json({ msg: 'yes' });
    } else {
      return res.json({ msg: 'no' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// User update
app.patch('/api/user/update', verifyToken, isUser, async (req, res) => {
  try {
    const { username, password, full_location } = req.body;
    const user = req.userDetails;
    
    // Check if username is being changed and already exists
    if (username && username !== user.username) {
      if (!validateUsername(username)) {
        return res.status(400).json({ 
          msg: "You cannot use spaces or these chars '!@#$%^&*()' you can do it like this: MyName or my_name" 
        });
      }
      
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(409).json({ msg: 'User name already exists' });
      }
      
      user.username = username;
    }
    
    // Update other fields
    if (full_location) user.full_location = full_location;
    
    // Update password if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    
    await user.save();
    
    res.json({ msg: 'Updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Add product
app.post('/api/product/add', verifyToken, isStore, upload.single('productImg'), async (req, res) => {
  try {
    const { name, desc, price, stock, country } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ msg: 'Missing product image' });
    }
    
    if (!name || !desc || !price || !stock || !country) {
      return res.status(400).json({ msg: 'All fields are required' });
    }
    
    // Save image path
    const imgPath = `/uploads/products/${req.file.filename}`;
    
    // Create new product
    const newProduct = await Product.create({
      store_id: req.user.store_id,
      store_name: req.user.store_name,
      name,
      desc,
      price: parseFloat(price),
      stock: parseInt(stock),
      country,
      img: imgPath
    });
    
    res.status(201).json({ msg: 'Product created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Update product
app.patch('/api/product/update', verifyToken, isStore, upload.single('productImg'), async (req, res) => {
  try {
    const { product_id, name, desc, price, stock, country } = req.body;
    
    if (!product_id) {
      return res.status(400).json({ msg: 'Product ID is required' });
    }
    
    const product = await Product.findByPk(product_id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found!' });
    }
    
    // Check if the store owns the product
    if (product.store_id !== req.user.store_id) {
      return res.status(403).json({ msg: 'You are not authorized to do this action' });
    }
    
    // Update fields
    if (name) product.name = name;
    if (desc) product.desc = desc;
    if (price) product.price = parseFloat(price);
    if (stock) product.stock = parseInt(stock);
    if (country) product.country = country;
    
    // Update image if provided
    if (req.file) {
      // Delete old image if it exists
      if (product.img && product.img.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, product.img);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      product.img = `/uploads/products/${req.file.filename}`;
    }
    
    await product.save();
    
    res.json({ msg: 'Product updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

app.options('/api/product/update', cors());

// Delete product
app.delete('/api/product/delete', verifyToken, isStore, async (req, res) => {
  try {
    const { product_id } = req.body;
    
    if (!product_id) {
      return res.status(400).json({ msg: 'Product ID is required' });
    }
    
    const product = await Product.findByPk(product_id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found!' });
    }
    
    // Check if the store owns the product
    if (product.store_id !== req.user.store_id) {
      return res.status(403).json({ msg: 'You are not authorized to do this action' });
    }
    
    // Delete product image
    if (product.img && product.img.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, product.img);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }
    
    await product.destroy();
    
    res.json({ msg: 'Product deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Add to cart
app.post('/api/cart/add', verifyToken, isUser, async (req, res) => {
  try {
    const { 
      store_id, store_name, product_id, quantity, 
      country, full_location, name, price, img 
    } = req.body;
    
    if (!store_id || !store_name || !product_id || !country || 
        !full_location || !name || !price || !img) {
      return res.status(400).json({ msg: 'All fields are required!' });
    }
    
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found!' });
    }
    
    const store = await Store.findByPk(store_id);
    if (!store) {
      return res.status(404).json({ msg: 'Store not found!' });
    }
    
    const newCart = await Cart.create({
      user_id: req.user.user_id,
      username: req.user.username,
      store_id,
      store_name,
      product_id,
      quantity: quantity || 1,
      country,
      full_location,
      name,
      price,
      img
    });
    
    res.status(201).json({ msg: `Product '${name}' added to cart successfully!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Update cart
app.patch('/api/cart/update', verifyToken, isUser, async (req, res) => {
  try {
    const { cart_id, quantity, country, full_location } = req.body;
    
    const cart = await Cart.findByPk(cart_id);
    
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found!' });
    }
    
    // Check if the user owns the cart
    if (cart.user_id !== req.user.user_id) {
      return res.status(403).json({ msg: 'You are not authorized to update this cart' });
    }
    
    // Validate quantity
    if (quantity !== undefined && quantity < 1) {
      return res.status(400).json({ msg: 'Quantity must be at least 1!' });
    }
    
    // Update fields
    if (quantity !== undefined) cart.quantity = quantity;
    if (country) cart.country = country;
    if (full_location) cart.full_location = full_location;
    
    await cart.save();
    
    res.json({ msg: 'Cart information updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Delete cart
app.delete('/api/cart/delete', verifyToken, isUser, async (req, res) => {
  try {
    const { cart_id } = req.body;
    
    if (!cart_id) {
      return res.status(400).json({ msg: 'Cart ID is required' });
    }
    
    const cart = await Cart.findByPk(cart_id);
    
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found!' });
    }
    
    // Check if the user owns the cart
    if (cart.user_id !== req.user.user_id) {
      return res.status(403).json({ msg: 'You are not authorized to delete this cart' });
    }
    
    await cart.destroy();
    
    res.json({ msg: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Add order
app.post('/api/order/add', verifyToken, isUser, async (req, res) => {
  try {
    const { 
      quantity, country, full_location, 
      store_name, product_id, store_id, cart_id 
    } = req.body;
    
    if (!quantity || !country || !full_location || 
        !store_name || !product_id || !store_id || !cart_id) {
      return res.status(400).json({ msg: 'All fields are required!' });
    }
    
    // Create new order
    const newOrder = await Order.create({
      user_id: req.user.user_id,
      username: req.user.username,
      quantity,
      country,
      full_location,
      store_name,
      product_id,
      store_id
    });
    
    // Delete cart item
    const cart = await Cart.findByPk(cart_id);
    if (!cart) {
      return res.status(404).json({ msg: 'Cart item not found' });
    }
    
    await cart.destroy();
    
    res.status(201).json({ msg: 'Order placed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Complete order
app.post('/api/order/done', verifyToken, isStore, async (req, res) => {
  try {
    const { order_id } = req.body;
    
    if (!order_id) {
      return res.status(400).json({ msg: 'Order ID is required' });
    }
    
    const order = await Order.findByPk(order_id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Check if the store owns the order
    if (order.store_id !== req.user.store_id) {
      return res.status(403).json({ msg: 'You are not authorized to do this action' });
    }
    
    await order.destroy();
    
    res.json({ msg: 'Thanks for completing this order, I hope everything was going well!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get store
app.get('/api/store/:store_name', async (req, res) => {
  try {
    const { store_name } = req.params;
    
    const store = await Store.findOne({ where: { store_name } });
    
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    res.json({
      store_id: store.store_id,
      bio: store.bio,
      store_name: store.store_name,
      full_location: store.full_location,
      img: store.img
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get product
app.get('/api/product/:product_id', async (req, res) => {
  try {
    const { product_id } = req.params;
    
    const product = await Product.findByPk(product_id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    res.json({
      product_id: product.product_id,
      store_id: product.store_id,
      store_name: product.store_name,
      country: product.country,
      name: product.name,
      desc: product.desc,
      price: product.price,
      stock: product.stock,
      img: product.img
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get cart
app.get('/api/cart', verifyToken, isUser, async (req, res) => {
  try {
    const cart = await Cart.findAll({ 
      where: { user_id: req.user.user_id } 
    });
    
    if (!cart || cart.length === 0) {
      return res.status(404).json({ msg: 'No items found in your cart!' });
    }
    
    res.json(cart.map(item => ({
      cart_id: item.cart_id,
      price: item.price,
      img: item.img,
      user_id: item.user_id,
      username: item.username,
      country: item.country,
      full_location: item.full_location,
      store_name: item.store_name,
      name: item.name,
      product_id: item.product_id,
      store_id: item.store_id,
      quantity: item.quantity
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get orders for store
app.post('/api/order/see', verifyToken, isStore, async (req, res) => {
  try {
    const orders = await Order.findAll({ 
      where: { store_id: req.user.store_id } 
    });
    
    if (!orders || orders.length === 0) {
      return res.status(404).json({ msg: 'No orders found!' });
    }
    
    res.json(orders.map(order => ({
      order_id: order.order_id,
      user_id: order.user_id,
      username: order.username,
      country: order.country,
      full_location: order.full_location,
      store_name: order.store_name,
      product_id: order.product_id,
      store_id: order.store_id,
      quantity: order.quantity
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get all products
app.get('/api/product/get/it/all', async (req, res) => {
  try {
    const products = await Product.findAll();
    
    res.send(products)
    console.log(products)
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get store products
app.get('/api/product/store/:store_id', async (req, res) => {
  try {
    const { store_id } = req.params;
    
    const products = await Product.findAll({ 
      where: { store_id } 
    });
    
    res.json(products.map(product => ({
      product_id: product.product_id,
      store_id: product.store_id,
      store_name: product.store_name,
      country: product.country,
      name: product.name,
      desc: product.desc,
      price: product.price,
      stock: product.stock,
      img: product.img
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get inbox
app.post('/api/inbox', verifyToken, async (req, res) => {
  try {
    if (req.user.store_id) {
      // Store inbox
      const chats = await Chat.findAll({ 
        where: { store: req.user.store_name } 
      });
      
      return res.json(chats.map(chat => ({
        username: chat.user,
        store_name: chat.store
      })));
    } else if (req.user.user_id) {
      // User inbox
      const chats = await Chat.findAll({ 
        where: { user: req.user.username } 
      });
      
      return res.json(chats.map(chat => ({
        username: chat.user,
        store_name: chat.store
      })));
    } else {
      return res.status(400).json({ msg: 'Invalid data in JWT' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Follow store
app.post('/api/follow', verifyToken, isUser, async (req, res) => {
  try {
    const { store_id, store_name } = req.body;
    
    if (!store_id || !store_name) {
      return res.status(400).json({ error: 'Missing store_id or store_name' });
    }
    
    const existingFollow = await Follow.findOne({
      where: {
        user_id: req.user.user_id,
        store_id
      }
    });
    
    if (!existingFollow) {
      await Follow.create({
        user_id: req.user.user_id,
        username: req.user.username,
        store_id,
        store_name
      });
      
      return res.json({ msg: 'Followed!' });
    }
    
    return res.json({ msg: 'Already following this store' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get followers count
app.get('/api/follow', async (req, res) => {
  try {
    const { store_id } = req.query;
    
    if (!store_id) {
      return res.status(400).json({ error: 'store_id is required' });
    }
    
    const count = await Follow.count({ where: { store_id } });
    
    return res.json({ followers_count: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Check if user follows store
app.post('/is/follow', verifyToken, isUser, async (req, res) => {
  try {
    const { store_id } = req.body;
    
    if (!store_id) {
      return res.status(400).json({ error: 'Missing store_id' });
    }
    
    const isFollowing = await Follow.findOne({
      where: {
        user_id: req.user.user_id,
        store_id
      }
    });
    
    return res.json({ msg: isFollowing ? 'followed' : 'Not followed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Sync database and start server
const PORT = process.env.PORT || 3001;

sequelize.sync()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
