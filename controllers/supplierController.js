const Supplier = require('../models/Supplier');


exports.list = async (req, res) => {
const suppliers = await Supplier.find().sort({ name: 1 });
res.render('suppliers/list', { suppliers });
}


exports.showCreate = (req, res) => res.render('suppliers/form', { supplier: {} });


exports.create = async (req, res) => {
const { name, address, phone } = req.body;
const s = new Supplier({ name, address, phone });
await s.save();
res.redirect('/suppliers');
}


exports.showEdit = async (req, res) => {
const s = await Supplier.findById(req.params.id);
res.render('suppliers/form', { supplier: s });
}


exports.update = async (req, res) => {
const { name, address, phone } = req.body;
await Supplier.findByIdAndUpdate(req.params.id, { name, address, phone });
res.redirect('/suppliers');
}


exports.remove = async (req, res) => {
await Supplier.findByIdAndDelete(req.params.id);
res.redirect('/suppliers');
}


exports.view = async (req, res) => {
const s = await Supplier.findById(req.params.id);
res.render('suppliers/view', { supplier: s });
}