const express = require('express');
const fileUpload = require('express-fileupload');
const pdf = require('pdf-lib');
const { WordRenderer } = require('pdf-to-word');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(fileUpload());

app.post('/convert', async (req, res) => {
    try {
        if (!req.files || !req.files.pdf) {
            return res.status(400).send('No PDF file uploaded');
        }

        const pdfFile = req.files.pdf;
        const format = req.body.format || 'docx';
        const quality = req.body.quality || 'medium';
        const preserveLayout = req.body.preserveLayout === 'true';

        // Convert PDF to Word
        const pdfDoc = await pdf.PDFDocument.load(pdfFile.data);
        const wordRenderer = new WordRenderer();
        
        const wordBuffer = await wordRenderer.render(pdfDoc, {
            format,
            quality,
            preserveLayout
        });

        // Set appropriate headers
        const outputFilename = pdfFile.name.replace('.pdf', `.${format}`);
        res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
        
        if (format === 'docx') {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        } else if (format === 'doc') {
            res.setHeader('Content-Type', 'application/msword');
        } else {
            res.setHeader('Content-Type', 'application/rtf');
        }

        // Send the converted file
        res.send(wordBuffer);

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).send('Conversion failed');
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
