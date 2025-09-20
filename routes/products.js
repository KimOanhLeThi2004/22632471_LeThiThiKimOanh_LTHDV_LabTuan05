const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// 📌 List products với search & filter
router.get('/', async (req, res) => {
  try {
    const { q, supplier } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (supplier) filter.supplier = supplier;

    const products = await Product.find(filter).populate('supplier').sort({ createdAt: -1 });
    const suppliers = await Supplier.find().sort({ name: 1 });

    res.render('products/list', { title: 'Products', products, suppliers, q, supplier });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 📌 Show create form
router.get('/create', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.render('products/form', { title: 'Add Product', product: {}, suppliers });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 📌 Handle create
router.post('/create', async (req, res) => {
  try {
    const { name, price, quantity, supplier } = req.body;
    if (!supplier) return res.status(400).send('Supplier is required');

    const product = new Product({ name, price, quantity, supplier });
    await product.save();
    res.redirect('/products');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 📌 Show edit form
router.get('/edit/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found');

    const suppliers = await Supplier.find().sort({ name: 1 });
    res.render('products/form', { title: 'Edit Product', product, suppliers });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 📌 Handle update
router.post('/edit/:id', async (req, res) => {
  try {
    const { name, price, quantity, supplier } = req.body;
    if (!supplier) return res.status(400).send('Supplier is required');

    await Product.findByIdAndUpdate(req.params.id, { name, price, quantity, supplier });
    res.redirect('/products');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 📌 Delete product
router.post('/delete/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/products');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
