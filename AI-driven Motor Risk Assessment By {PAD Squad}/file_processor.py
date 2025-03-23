import pandas as pd
import os
from werkzeug.utils import secure_filename

class FileProcessor:
    def __init__(self, upload_folder='uploads'):
        self.upload_folder = upload_folder
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        self.allowed_extensions = {'csv'}

    def allowed_file(self, filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in self.allowed_extensions

    def process_file(self, file):
        if file and self.allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(self.upload_folder, filename)
            file.save(filepath)
            
            try:
                # Read CSV file
                df = pd.read_csv(filepath)
                
                # Convert data types to be JSON serializable
                for col in df.columns:
                    if pd.api.types.is_integer_dtype(df[col]):
                        df[col] = df[col].astype('int64')
                    elif pd.api.types.is_float_dtype(df[col]):
                        df[col] = df[col].astype('float64')
                
                # Basic statistics
                stats = {
                    'total_rows': int(len(df)),
                    'total_columns': int(len(df.columns)),
                    'column_names': df.columns.tolist(),
                    'data_types': {col: str(dtype) for col, dtype in df.dtypes.items()}
                }
                
                # Sample data (first 5 rows)
                sample_data = df.head().to_dict('records')
                
                # Clean up the temporary file
                if os.path.exists(filepath):
                    os.remove(filepath)
                
                return {
                    'success': True,
                    'message': 'File processed successfully',
                    'stats': stats,
                    'sample_data': sample_data
                }
                
            except Exception as e:
                # Clean up the temporary file in case of error
                if os.path.exists(filepath):
                    os.remove(filepath)
                return {
                    'success': False,
                    'message': f'Error processing file: {str(e)}'
                }
        else:
            return {
                'success': False,
                'message': 'Invalid file type. Only CSV files are allowed.'
            }

# Example usage:
if __name__ == '__main__':
    # This is just for testing
    processor = FileProcessor()
    # You would typically use this in a web application
    # where file is uploaded through a form 