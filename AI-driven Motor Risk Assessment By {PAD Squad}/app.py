from flask import Flask, render_template, request, jsonify, send_from_directory
from file_processor import FileProcessor
import os

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
processor = FileProcessor()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file part'
            })
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No selected file'
            })
        
        if not file.filename.endswith('.csv'):
            return jsonify({
                'success': False,
                'message': 'Please upload a CSV file'
            })
        
        result = processor.process_file(file)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error processing file: {str(e)}'
        })

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True)
