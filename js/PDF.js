<script>
        // Set PDF.js worker path
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
        
        document.addEventListener('DOMContentLoaded', function() {
            const uploadArea = document.getElementById('upload-area');
            const browseBtn = document.getElementById('browse-btn');
            const fileInput = document.getElementById('file-input');
            const fileName = document.getElementById('file-name');
            const fileSize = document.getElementById('file-size');
            const fileInfo = document.getElementById('file-info');
            const removeFileBtn = document.getElementById('remove-file');
            const errorMessage = document.getElementById('error-message');
            const convertBtn = document.getElementById('convert-btn');
            const progressContainer = document.getElementById('progress-container');
            const progressBar = document.getElementById('progress');
            const progressPercent = document.getElementById('progress-percent');
            const progressStatus = document.getElementById('progress-status');
            const resultContainer = document.getElementById('result-container');
            const downloadBtn = document.getElementById('download-btn');
            
            let selectedFile = null;
            
            // Initialize PDF.js
            pdfjsLib.getDocument({}).promise.then(() => {
                console.log('PDF.js initialized');
            });
            
            // Handle browse button click
            browseBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            // Handle drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('active');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('active');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('active');
                
                if (e.dataTransfer.files.length) {
                    handleFileSelection(e.dataTransfer.files[0]);
                }
            });
            
            // Handle file selection
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length) {
                    handleFileSelection(fileInput.files[0]);
                }
            });
            
            // Handle remove file
            removeFileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                resetFileSelection();
            });
            
            // Process selected file
            function handleFileSelection(file) {
                // Validate file type
                if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
                    showError();
                    return;
                }
                
                // Validate file size (25MB max)
                if (file.size > 25 * 1024 * 1024) {
                    showError();
                    return;
                }
                
                selectedFile = file;
                errorMessage.style.display = 'none';
                convertBtn.disabled = false;
                
                // Display file info
                fileName.textContent = file.name;
                fileSize.textContent = formatFileSize(file.size);
                fileInfo.style.display = 'flex';
                
                // Set default output name
                document.getElementById('output-name').placeholder = file.name.replace('.pdf', '');
            }
            
            // Format file size
            function formatFileSize(bytes) {
                if (bytes < 1024) return bytes + ' bytes';
                else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
                else return (bytes / 1048576).toFixed(1) + ' MB';
            }
            
            // Show error
            function showError() {
                errorMessage.style.display = 'block';
                fileInfo.style.display = 'none';
                convertBtn.disabled = true;
                resetFileSelection();
            }
            
            // Reset file selection
            function resetFileSelection() {
                selectedFile = null;
                fileInput.value = '';
                fileInfo.style.display = 'none';
                convertBtn.disabled = true;
                resultContainer.style.display = 'none';
            }
            
            // Handle conversion
            convertBtn.addEventListener('click', async () => {
                if (!selectedFile) {
                    showError();
                    return;
                }
                
                // Hide result and show progress
                resultContainer.style.display = 'none';
                progressContainer.style.display = 'block';
                convertBtn.disabled = true;
                
                try {
                    // Read the PDF file
                    progressStatus.textContent = 'Loading PDF file...';
                    progressBar.style.width = '5%';
                    progressPercent.textContent = '5%';
                    
                    const arrayBuffer = await readFileAsArrayBuffer(selectedFile);
                    
                    // Load the PDF document
                    progressStatus.textContent = 'Processing PDF content...';
                    progressBar.style.width = '20%';
                    progressPercent.textContent = '20%';
                    
                    const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
                    
                    // Create a new Word document
                    const { Document, Paragraph, TextRun, Packer } = docx;
                    const doc = new Document();
                    const paragraphs = [];
                    
                    // Extract text from each page
                    const totalPages = pdfDoc.numPages;
                    for (let i = 1; i <= totalPages; i++) {
                        const progress = 20 + (i / totalPages) * 60;
                        progressBar.style.width = `${progress}%`;
                        progressPercent.textContent = `${Math.floor(progress)}%`;
                        progressStatus.textContent = `Processing page ${i} of ${totalPages}...`;
                        
                        const page = await pdfDoc.getPage(i);
                        const textContent = await page.getTextContent();
                        const text = textContent.items.map(item => item.str).join(' ');
                        
                        paragraphs.push(
                            new Paragraph({
                                children: [new TextRun(text)],
                            })
                        );
                        
                        // Add page break (except after last page)
                        if (i < totalPages) {
                            paragraphs.push(
                                new Paragraph({
                                    children: [new TextRun("")],
                                    pageBreakBefore: true
                                })
                            );
                        }
                    }
                    
                    doc.addSection({
                        children: paragraphs,
                    });
                    
                    // Generate the Word document
                    progressStatus.textContent = 'Generating Word document...';
                    progressBar.style.width = '90%';
                    progressPercent.textContent = '90%';
                    
                    const blob = await Packer.toBlob(doc);
                    
                    // Create download link
                    progressStatus.textContent = 'Preparing download...';
                    progressBar.style.width = '100%';
                    progressPercent.textContent = '100%';
                    
                    const outputName = document.getElementById('output-name').value || 
                                      selectedFile.name.replace('.pdf', '');
                    const outputFormat = document.getElementById('output-format').value;
                    const downloadUrl = URL.createObjectURL(blob);
                    
                    downloadBtn.href = downloadUrl;
                    downloadBtn.download = `${outputName}.${outputFormat}`;
                    
                    // Show result and hide progress
                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                        resultContainer.style.display = 'block';
                        convertBtn.disabled = false;
                    }, 500);
                    
                    // Clean up when download is complete
                    downloadBtn.addEventListener('click', () => {
                        setTimeout(() => {
                            URL.revokeObjectURL(downloadUrl);
                        }, 100);
                    });
                    
                } catch (error) {
                    console.error('Conversion error:', error);
                    progressStatus.textContent = `Error: ${error.message}`;
                    progressBar.style.background = 'var(--warning)';
                    convertBtn.disabled = false;
                }
            });
            
            // Helper function to read file as ArrayBuffer
            function readFileAsArrayBuffer(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(file);
                });
            }
        });
    </script>
