const Product = require('../models/Product');
const Supplier = require('../models/Supplier');


exports.list = async (req, res) => {
const { q, supplier } = req.query;
const filter = {};
if (q) filter.name = { $regex: q, $options: 'i' };
if (supplier) filter.supplier = supplier;
const products = await Product.find(filter).populate('supplier').sort({ createdAt: -1 });
const suppliers = await Supplier.find().sort({ name: 1 });
res.render('products/list', { products, suppliers, q, supplier });
}


exports.showCreate = async (req, res) => {
const suppliers = await Supplier.find();
res.render('products/form', { product: {}, suppliers });
}


exports.create = async (req, res) => {
const { name, price, quantity, supplier } = req.body;
const p = new Product({ name, price, quantity, supplier });
await p.save();
res.redirect('/products');
}


exports.showEdit = async (req, res) => {
const product = await Product.findById(req.params.id);
const suppliers = await Supplier.find();
res.render('products/form', { product, suppliers });
}


exports.update = async (req, res) => {
const { name, price, quantity, supplier } = req.body;
await Product.findByIdAndUpdate(req.params.id, { name, price, quantity, supplier });
res.redirect('/products');
}


exports.remove = async (req, res) => {
await Product.findByIdAndDelete(req.params.id);
res.redirect('/products');
}


exports.view = a