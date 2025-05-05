<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF to Word Converter</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/docx/7.1.0/docx.min.js"></script>
    <style>
        /* [Previous CSS remains exactly the same] */
    </style>
</head>
<body>
    <!-- [Previous HTML structure remains the same] -->

    <script>
        // Set PDF.js worker path
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
        
        document.addEventListener('DOMContentLoaded', function() {
            // [Previous variable declarations remain the same]
            
            // Initialize PDF.js
            const loadingTask = pdfjsLib.getDocument({});
            loadingTask.promise.then(() => {
                console.log('PDF.js initialized successfully');
            }).catch(err => {
                console.error('PDF.js initialization error:', err);
                showError('Failed to initialize PDF processor');
            });
            
            // [Previous event listeners remain the same until convertBtn click handler]
            
            convertBtn.addEventListener('click', async () => {
                if (!selectedFile) {
                    showError('No file selected');
                    return;
                }
                
                // Reset previous state
                resultContainer.style.display = 'none';
                progressContainer.style.display = 'block';
                progressBar.style.width = '0%';
                progressPercent.textContent = '0%';
                convertBtn.disabled = true;
                errorMessage.style.display = 'none';
                
                try {
                    // Validate file again (in case it changed)
                    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
                        throw new Error('Invalid file type. Please select a PDF file.');
                    }
                    
                    if (selectedFile.size > 25 * 1024 * 1024) {
                        throw new Error('File size exceeds 25MB limit.');
                    }
                    
                    // Update progress
                    updateProgress(5, 'Reading PDF file...');
                    
                    // Read file content
                    const arrayBuffer = await readFileAsArrayBuffer(selectedFile);
                    
                    // Load PDF document
                    updateProgress(20, 'Processing PDF content...');
                    const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
                    
                    // Create Word document
                    const { Document, Paragraph, TextRun, Packer } = docx;
                    const doc = new Document();
                    const paragraphs = [];
                    const totalPages = pdfDoc.numPages;
                    
                    // Process each page
                    for (let i = 1; i <= totalPages; i++) {
                        const progress = 20 + (i / totalPages * 60);
                        updateProgress(progress, `Processing page ${i} of ${totalPages}...`);
                        
                        try {
                            const page = await pdfDoc.getPage(i);
                            const textContent = await page.getTextContent();
                            const text = textContent.items.map(item => item.str).join(' ');
                            
                            paragraphs.push(new Paragraph({
                                children: [new TextRun(text)]
                            }));
                            
                            if (i < totalPages) {
                                paragraphs.push(new Paragraph({
                                    children: [new TextRun("")],
                                    pageBreakBefore: true
                                }));
                            }
                        } catch (pageError) {
                            console.warn(`Error processing page ${i}:`, pageError);
                            continue;
                        }
                    }
                    
                    doc.addSection({ children: paragraphs });
                    
                    // Generate Word file
                    updateProgress(90, 'Generating Word document...');
                    const blob = await Packer.toBlob(doc);
                    
                    // Prepare download
                    updateProgress(95, 'Preparing download...');
                    const outputName = document.getElementById('output-name').value || 
                                      selectedFile.name.replace(/\.pdf$/i, '');
                    const outputFormat = document.getElementById('output-format').value;
                    const downloadUrl = URL.createObjectURL(blob);
                    
                    // Set up download link
                    downloadBtn.onclick = () => {
                        setTimeout(() => {
                            URL.revokeObjectURL(downloadUrl);
                            progressContainer.style.display = 'none';
                        }, 100);
                    };
                    downloadBtn.href = downloadUrl;
                    downloadBtn.download = `${outputName}.${outputFormat}`;
                    
                    // Show result
                    updateProgress(100, 'Conversion complete!');
                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                        resultContainer.style.display = 'block';
                        convertBtn.disabled = false;
                    }, 500);
                    
                } catch (error) {
                    console.error('Conversion failed:', error);
                    showError(error.message || 'Conversion failed');
                    progressBar.style.backgroundColor = 'var(--warning)';
                    progressStatus.textContent = 'Error: ' + (error.message || 'Conversion failed');
                    convertBtn.disabled = false;
                }
            });
            
            // Helper functions
            function updateProgress(percent, message) {
                progressBar.style.width = `${percent}%`;
                progressPercent.textContent = `${Math.floor(percent)}%`;
                if (message) progressStatus.textContent = message;
            }
            
            function showError(message) {
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';
            }
            
            function readFileAsArrayBuffer(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsArrayBuffer(file);
                });
            }
        });
    </script>
</body>
</html>
