// Mobile Menu Toggle
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    document.querySelector('.navbar').classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.navbar ul li a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.navbar').classList.remove('active');
    });
});

// Tool Modal Functions
function openToolModal(toolId) {
    // In a real implementation, you would load the appropriate tool interface here
    const modalContent = document.getElementById('modalContent');
    
    // Simple example for PDF to Word tool
    if (toolId === 'pdf-to-word') {
        modalContent.innerHTML = `
            <div class="tool-interface">
                <h3>PDF to Word Converter</h3>
                <p>Convert your PDF files to editable Word documents (.docx)</p>
                
                <div class="file-upload-area" id="dropArea">
                    <i class="fas fa-file-upload"></i>
                    <p>Drag & drop your PDF file here or click to browse</p>
                    <input type="file" id="fileInput" accept=".pdf" style="display: none;">
                    <button class="btn" onclick="document.getElementById('fileInput').click()">Select File</button>
                </div>
                
                <div class="options-section">
                    <h4>Conversion Options</h4>
                    <div class="option-group">
                        <label for="outputFormat">Output Format:</label>
                        <select id="outputFormat">
                            <option value="docx">Word Document (.docx)</option>
                            <option value="doc">Word 97-2003 Document (.doc)</option>
                            <option value="rtf">Rich Text Format (.rtf)</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label for="ocrOption">OCR (Text Recognition):</label>
                        <select id="ocrOption">
                            <option value="auto">Auto-detect (Recommended)</option>
                            <option value="enabled">Force OCR</option>
                            <option value="disabled">Disable OCR</option>
                        </select>
                    </div>
                </div>
                
                <button class="process-btn" onclick="processFile()">Convert to Word</button>
                
                <div class="download-section" id="downloadSection">
                    <i class="fas fa-check-circle"></i>
                    <h4>Conversion Complete!</h4>
                    <p>Your file has been successfully converted to Word format.</p>
                    <a href="#" class="download-btn" id="downloadLink">Download Word File</a>
                </div>
            </div>
        `;
    }
    
    // Show the modal
    document.getElementById('toolModal').style.display = 'block';
    
    // Initialize file upload functionality
    initFileUpload();
}

function closeToolModal() {
    document.getElementById('toolModal').style.display = 'none';
}

function initFileUpload() {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    
    if (!dropArea || !fileInput) return;
    
    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    // Handle selected files
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            // In a real implementation, you would process the file here
            console.log('File selected:', file.name);
            
            // Update UI to show selected file
            dropArea.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <p>${file.name}</p>
                <small>${formatFileSize(file.size)}</small>
            `;
        }
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function processFile() {
    // In a real implementation, this would process the file
    console.log('Processing file...');
    
    // Simulate processing delay
    setTimeout(() => {
        document.getElementById('downloadSection').style.display = 'block';
        
        // Scroll to download section
        document.getElementById('downloadSection').scrollIntoView({ behavior: 'smooth' });
    }, 2000);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('toolModal');
    if (event.target === modal) {
        closeToolModal();
    }
});
