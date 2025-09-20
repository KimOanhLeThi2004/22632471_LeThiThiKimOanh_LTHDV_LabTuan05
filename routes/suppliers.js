const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// 📌 List all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.render('suppliers/list', { title: 'Suppliers', suppliers });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 📌 View supplier detail
router.get('/view/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).send('Supplier not found');
    res.render('suppliers/view', { title: supplier.name, supplier });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 📌 Create form
router.get('/create', (req, res) => {
  res.render('suppliers/form', { title: 'Add Supplier', supplier: {} });
});

// 📌 Handle create
router.post('/create', async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.redirect('/suppliers');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 📌 Edit form
router.get('/edit/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).send('Supplier not found');
    res.render('suppliers/form', { title: 'Edit Supplier', supplier });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 📌 Handle update
router.post('/edit/:id', async (req, res) => {
  try {
    await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.redirect('/suppliers');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 📌 Handle delete
router.post('/delete/:id', async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.redirect('/suppliers');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
