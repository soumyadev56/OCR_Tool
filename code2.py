from flask import Flask, request, jsonify
from flask_cors import CORS
from pdf2image import convert_from_path
import cv2, numpy as np, pytesseract, re, os
import logging
import psycopg2


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

 

# Tesseract configuration
pytesseract.pytesseract.tesseract_cmd = os.getenv(
    'TESSERACT_CMD', r'C:\Program Files\Tesseract-OCR\tesseract.exe'
)

# Database credentials from environment variables
DB_NAME = os.getenv('DB_NAME', 'bill_db')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'Soumyadev@11')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

# Database connection function
def get_db_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )


# Try connecting to the database
try:
    conn = get_db_connection()
    cursor = conn.cursor()
    logger.info("Database connection successful.")
except Exception as e:
    logger.error(f"Database error: {e}")



cursor.execute("""
CREATE TABLE IF NOT EXISTS bill_data (
    Stand_No TEXT,
    Street_No TEXT,
    Stand_valuation TEXT,
    ACC_No BIGINT PRIMARY KEY,
    Route_No TEXT,
    Deposit TEXT,
    Guarantee TEXT,
    Acc_Date TEXT,
    Improvements TEXT,
    Payments_up_to TEXT,
    VAT_Reg_No TEXT,
    Balance_B_F TEXT,
    Payments TEXT,
    Sub_total TEXT,
    Month_total TEXT,
    Total_due TEXT,
    Over_90 TEXT,
    Ninety_days TEXT,
    Sixty_days TEXT,
    Thirty_days TEXT,
    Current TEXT,
    Due_Date TEXT
);
""")

conn.commit()
cursor.close()
logger.info("Table schema updated successfully!")

conn.close()
logger.info("Table schema verified successfully!")

def extract_bill_details(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()



# === OCR & Extraction Logic ===
def process_invoice(pdf_path):
    try:
        # 1. Convert PDF to images
        pages = convert_from_path(pdf_path, dpi=300)
        cv_images = [cv2.cvtColor(np.array(p), cv2.COLOR_RGB2BGR) for p in pages]
        invoice = cv2.vconcat(cv_images)

        # 2. Preprocess
        gray = cv2.cvtColor(invoice, cv2.COLOR_BGR2GRAY)
        gray = cv2.bilateralFilter(gray, 9, 75, 75)
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 10
        )

        # 3. OCR
        ocr_raw = pytesseract.image_to_string(thresh, lang='eng')
        lines = [L.strip() for L in ocr_raw.splitlines() if L.strip()]
        full_text = re.sub(r'\s+', ' ', ocr_raw)

        # 4. Identify header/footer
        ix = next((i for i, L in enumerate(lines) if 'Stand No' in L), len(lines))
        first_5_customer = lines[:min(ix, 5)]
        f_ix = next((i for i, L in enumerate(lines) if 'Phone:' in L), None)
        footer_block = (lines[max(f_ix - 6, 0):f_ix + 1] if f_ix is not None else [])

        # 5. Patterns
        patterns = {
            'Stand No': r'Stand\s*No[:\s\-]*([A-Za-z0-9\*]+)',
            'Street No': r'Street\s*No.*?([A-Za-z0-9,\s]+?)\s{2,}',
            'Stand (valuation)': r'Valuation.*?(\d[\d,\.]*)',
            'ACC No': r'Acc\s*No.*?(\d{6,})',
            'Route No': r'Route\s*No.*?([A-Za-z0-9-]+)',
            'Deposit': r'Deposit.*?(\d[\d,\.]*)',
            'Guarantee': r'Guarantee.*?(\d[\d,\.]*)',
            'Acc Date': r'Acc\s*Date.*?([A-Za-z]+\s+\d{4})',
            'Improvements': r'Improvements.*?(\d[\d,\.]*)',
            'Payments up to': r'Payments\s*up to.*?([\d/]{6,10})',
            'VAT Reg No': r'VAT\s*REG.*?(\d+)',
            'Balance B/F': r'Balance\s*B\/F.*?([-\d,\.]+)',
            'Payments': r'Payments(?!\s*up to).*?([-\d,\.]+)',
            'Sub total': r'Sub\s*total.*?([-\d,\.]+)',
            'Month total': r'Month\s*total.*?([-\d,\.]+)',
            'Total due': r'Total\s*due.*?([-\d,\.]+)',
            'Over 90': r'Over\s*90.*?([0-9,\.]+)',
            '90 days': r'90\s*Days.*?([0-9,\.]+)',
            '60 days': r'60\s*Days.*?([0-9,\.]+)',
            '30 days': r'30\s*Days.*?([0-9,\.]+)',
            'Current': r'Current.*?([0-9,\.]+)',
            'Due Date': r'Due\s*Date.*?([\d\/]+)',
            
        }

        # 6. Extract fields
        results = {key: (re.search(rx, full_text, re.IGNORECASE | re.DOTALL).group(1).strip()
                         if re.search(rx, full_text, re.IGNORECASE | re.DOTALL)
                         else None)
                   for key, rx in patterns.items()}

        # Add extra results
        results['First 5 Customer Rows'] = first_5_customer
        results['Footer Block'] = footer_block

        return {'success': True, 'results': results}

    except Exception as e:
        return {'success': False, 'error': str(e)}


# === Routes ===


@app.route('/')
def home():
    return jsonify({'message': 'API is running'}), 200

@app.route('/upload-bill', methods=['POST'])
def upload_bill():
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    text = extract_text_from_image(file)
    bill_data = extract_bill_data(text)

    # Save to database
    with closing(get_db_connection()) as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO bill_data (Account_Number, Bill_Number, Issue_Date, Due_Date, Amount)
                VALUES (%s, %s, %s, %s, %s);
            """, (
                bill_data['Account_Number'],
                bill_data['Bill_Number'],
                bill_data['Issue_Date'],
                bill_data['Due_Date'],
                bill_data['Amount']
            ))
            conn.commit()

    return jsonify({'message': 'Bill uploaded successfully', 'data': bill_data}), 200


@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    return jsonify({'message': 'File uploaded successfully', 'filePath': file_path})


@app.route('/scan', methods=['POST'])
def scan_pdf():
    data = request.get_json()
    file_path = data.get('filePath')

    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'Invalid or missing file path'}), 400

    result = process_invoice(file_path)
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
