document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('csvFile');
    const fileName = document.getElementById('fileName');
    const loading = document.querySelector('.loading');
    const output = document.getElementById('output');

    // Update filename display when file is selected
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileName.textContent = this.files[0].name;
        } else {
            fileName.textContent = '';
        }
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!fileInput.files.length) {
            alert('Please select a file');
            return;
        }

        const file = fileInput.files[0];
        if (!file.name.endsWith('.csv')) {
            alert('Please select a CSV file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        // Show loading
        loading.style.display = 'block';
        output.innerHTML = '';

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            // Hide loading
            loading.style.display = 'none';
            
            if (result.success) {
                output.innerHTML = `
                    <div class="alert alert-success">${result.message}</div>
                    <h4>File Statistics:</h4>
                    <ul>
                        <li>Total Rows: ${result.stats.total_rows}</li>
                        <li>Total Columns: ${result.stats.total_columns}</li>
                        <li>Column Names: ${result.stats.column_names.join(', ')}</li>
                    </ul>
                    <h4>Sample Data:</h4>
                    <pre>${JSON.stringify(result.sample_data, null, 2)}</pre>
                `;
            } else {
                output.innerHTML = `
                    <div class="alert alert-danger">${result.message}</div>
                `;
            }
        } catch (error) {
            loading.style.display = 'none';
            output.innerHTML = `
                <div class="alert alert-danger">Error processing file: ${error.message}</div>
            `;
        }
    });
}); 