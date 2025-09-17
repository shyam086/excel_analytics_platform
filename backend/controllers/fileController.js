const File = require('../models/File');
const XLSX = require('xlsx');
const path = require('path');

exports.uploadExcel = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: user not found" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = await File.create({
      user: req.user._id, // ✅ Correct field name
      filename: req.file.filename,
      originalName: req.file.originalname,
    });
    res.status(200).json({ file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.getUserFiles = async (req, res) => {
  const mongoose = require('mongoose');
  const files = await File.find({
    user: new mongoose.Types.ObjectId(req.user._id),
  }).sort({ uploadDate: -1 });
  res.json(files);
};

exports.getParsedFileData = async (req, res) => {
  const mongoose = require('mongoose');
  const file = await File.findOne({
    _id: req.params.id,
    user: new mongoose.Types.ObjectId(req.user._id)
  });
  if (!file) return res.status(404).json({ message: 'File not found' });

  const filePath = path.join(__dirname, '../uploads', file.filename);
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet);

  res.json(json);
};
