// backend/controllers/fileController.js
const File = require('../models/File');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

exports.uploadExcel = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: user not found" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = await File.create({
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
    });

    return res.status(200).json({ file });
  } catch (err) {
    console.error('uploadExcel error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.getUserFiles = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const files = await File.find({
      user: new mongoose.Types.ObjectId(req.user._id),
    }).sort({ uploadDate: -1 });

    return res.json(files);
  } catch (err) {
    console.error('getUserFiles error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getParsedFileData = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const fileId = req.params.id;
    if (!fileId) return res.status(400).json({ message: 'Missing file id' });

    const file = await File.findOne({
      _id: fileId,
      user: new mongoose.Types.ObjectId(req.user._id)
    });

    if (!file) {
      console.warn(`getParsedFileData: file not found for id=${fileId} user=${req.user._id}`);
      return res.status(404).json({ message: 'File not found' });
    }

    // Construct path to saved file
    const filePath = path.join(__dirname, '..', 'uploads', file.filename);
    console.log('getParsedFileData: attempting to read file at', filePath);

    // Check existence
    if (!fs.existsSync(filePath)) {
      console.error('getParsedFileData: stored file missing on disk:', filePath);
      return res.status(404).json({ message: 'Stored file not found on server' });
    }

    // Read and parse using xlsx
    let workbook;
    try {
      workbook = XLSX.readFile(filePath);
    } catch (err) {
      console.error('getParsedFileData: XLSX.readFile error:', err);
      return res.status(500).json({ message: 'Failed to read Excel file', error: err.message });
    }

    const firstSheetName = workbook.SheetNames && workbook.SheetNames[0];
    if (!firstSheetName) {
      console.warn('getParsedFileData: no sheets found in workbook for file:', filePath);
      return res.status(400).json({ message: 'Excel file contains no sheets' });
    }

    const sheet = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(sheet);

    // If sheet_to_json returns something unexpected, guard
    if (!Array.isArray(json)) {
      console.warn('getParsedFileData: sheet_to_json returned non-array', typeof json);
      return res.status(500).json({ message: 'Failed to parse sheet data' });
    }

    // Successful response: array of row objects
    return res.json(json);
  } catch (err) {
    console.error('getParsedFileData error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};