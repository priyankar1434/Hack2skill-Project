// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB-fzWO2CcoU7l-6jR_4D5MceNR3ylRxHY",
    authDomain: "ai-motor-insurance.firebaseapp.com",
    projectId: "ai-motor-insurance",
    storageBucket: "ai-motor-insurance.firebasestorage.app",
    messagingSenderId: "141686419187",
    appId: "1:141686419187:web:654a6dbe72f87da125d186",
    measurementId: "G-GBEX866P1C"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('csvFile');
    const fileName = document.getElementById('fileName');
    const output = document.getElementById('output');
    const loading = document.querySelector('.loading');

    // Display selected file name
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileName.textContent = `Selected file: ${this.files[0].name}`;
            fileName.style.display = 'block';
        } else {
            fileName.style.display = 'none';
        }
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!fileInput.files.length) {
            showError('Please select a CSV file');
            return;
        }

        const file = fileInput.files[0];
        if (!file.name.endsWith('.csv')) {
            showError('Please upload a CSV file');
            return;
        }

        // Show loading spinner
        loading.style.display = 'block';
        output.innerHTML = '';

        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Starting file upload...'); // Debug log
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            console.log('Response status:', response.status); // Debug log
            const data = await response.json();
            console.log('Response data:', data); // Debug log

            if (response.ok) {
                showResult(data.result, data.file_url, data.data);
            } else {
                showError(data.error || 'An error occurred while processing your request');
                console.error('Server error:', data.error); // Debug log
            }
        } catch (error) {
            console.error('Upload error:', error); // Debug log
            showError('An error occurred while uploading the file. Please try again.');
        } finally {
            loading.style.display = 'none';
        }
    });

    function showResult(result, fileUrl, data) {
        const resultBox = document.createElement('div');
        resultBox.className = 'result-box';
        
        resultBox.innerHTML = `
            <h3><i class="fas fa-check-circle"></i> Analysis Complete</h3>
            <p>Risk Assessment Result: <strong>${result}</strong></p>
            <p class="file-url">
                <i class="fas fa-link"></i> 
                <a href="${fileUrl}" target="_blank">View Uploaded File</a>
            </p>
            <div class="data-preview">
                <h4>Data Preview</h4>
                <table>
                    <thead>
                        <tr>
                            ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.slice(0, 5).map(row => `
                            <tr>
                                ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        output.appendChild(resultBox);
    }

    function showError(message) {
        output.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i> ${message}
                <p class="error-help">Please try again or contact support if the problem persists.</p>
            </div>
        `;
    }
});
