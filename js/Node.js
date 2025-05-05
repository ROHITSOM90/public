const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const port = 3000;

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));

// Handle file upload and compression
app.post('/compress', upload.single('pdfFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  
  const inputPath = req.file.path;
  const outputPath = 'compressed/' + req.file.filename;
  const compressionLevel = req.body.compressionLevel || 'medium';
  
  // Use a PDF compression library here
  compressPDF(inputPath, outputPath, compressionLevel, (err, result) => {
    if (err) {
      return res.status(500).send('Error compressing file');
    }
    
    res.json({
      success: true,
      originalSize: req.file.size,
      compressedSize: result.size,
      downloadLink: '/download/' + path.basename(outputPath)
    });
  });
});

// Handle file download
app.get('/download/:filename', (req, res) => {
  const file = path.join(__dirname, 'compressed', req.params.filename);
  res.download(file);
});

app.listen(port, () => {
  console.log(`PDF Compressor app listening at http://localhost:${port}`);
});

// PDF compression function (implementation depends on library)
function compressPDF(input, output, level, callback) {
  // Example using Ghostscript (would need to be installed on the server)
  let quality;
  switch(level) {
    case 'low': quality = '/screen'; break;
    case 'medium': quality = '/ebook'; break;
    case 'high': quality = '/printer'; break;
    case 'custom': quality = '/default'; break;
    default: quality = '/ebook';
  }
  
  exec(`gs -sDEVICE=pdfwrite -dPDFSETTINGS=${quality} -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${output} ${input}`, (error) => {
    if (error) {
      return callback(error);
    }
    
    fs.stat(output, (err, stats) => {
      if (err) {
        return callback(err);
      }
      callback(null, { size: stats.size });
    });
  });
}
