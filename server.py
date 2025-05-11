from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import fitz  # PyMuPDF
import re
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import psycopg2
from datetime import datetime
import pytz
import logging
from contextlib import closing


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


from flask_cors import CORS

app = Flask(__name__)
CORS(app) 


# Upload folder setup
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Tesseract configuration
pytesseract.pytesseract.tesseract_cmd = os.getenv(
    'TESSERACT_CMD',
    r'"C:\Program Files\Tesseract-OCR\tesseract.exe"'
)

# Database credentials from environment variables (fallbacks provided)
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
    id SERIAL PRIMARY KEY,
    page_number INTEGER,
    bill_date TEXT,
    total_amount TEXT,
    bank_name TEXT,
    bank_address TEXT,
    swift_code TEXT,
    upi_id TEXT,
    invoice_date TEXT,
    gstin_no TEXT,
    tax_invoice_no TEXT,
    pan TEXT,
    customer_vat_reg TEXT,
    company_vat_reg TEXT,
    tax_date TEXT,
    invoice_no TEXT,
    items TEXT,
    upload_datetime TIMESTAMP
);
""")

conn.commit()
cursor.close()
logger.info("Table schema updated successfully!")

conn.close()
logger.info("Table schema verified successfully!")

def preprocess_image(image_path):
    image = Image.open(image_path)

    image = image.convert('L')  # Convert to grayscale
    image = ImageEnhance.Contrast(image).enhance(2)  # Enhance contrast
    image = image.filter(ImageFilter.SHARPEN)  # Sharpen the image

    return image

def extract_text_from_image(image_path):
    image = preprocess_image(image_path)
    text = pytesseract.image_to_string(image)

    print(" Extracted text from image:\n", text)
    return text


def extract_details_from_text(text, page_num):
    bill_data = {"Page": page_num}
    print(f"Page: {bill_data['Page']}\nExtracted text:\n{text}\n")

    # --- Bill Date ---
    keyword_pattern = r'(Invoice Date|Bill Date|Date of Issue|Date)[:\s]*'
    date_pattern = r'(\b\d{1,2}[-/\s]\w{3}[-/\s]\d{4}\b|\b\d{1,2}[-/\s]\d{1,2}[-/\s]\d{2,4}\b|\b\w+\s\d{1,2},\s\d{4}\b)'
    combined_pattern = keyword_pattern + date_pattern
    date_match = re.findall(combined_pattern, text, re.IGNORECASE)

    if date_match:
        bill_data["Bill Date"] = date_match[0][1]  # First match
    else:
        standalone_date_pattern = date_pattern
        standalone_date_match = re.findall(standalone_date_pattern, text, re.IGNORECASE)
        if standalone_date_match:
            bill_data["Bill Date"] = standalone_date_match[0]

    # --- Total Amount ---
    amount_pattern = r'(Total Taxable Value|Total|Grand Total|Amount Payable|Total Amount)[:\s]+([\d,]+\.\d{2})'
    amount_match = re.findall(amount_pattern, text, re.IGNORECASE)

    if amount_match:
        print(f" Total amount found on page {page_num}")
        bill_data["Total Amount"] = amount_match[0][1]

    # --- Beneficiary Bank Name ---
    bank_name_pattern = r'Bank Name\s*([A-Za-z\s&.,-]+? Ltd)'
    bank_name_match = re.search(bank_name_pattern, text, re.IGNORECASE)

    if bank_name_match:
        bill_data["Beneficiary Bank Name"] = bank_name_match.group(1).replace('\n', '').strip()
        print(f" Bank name found on page {page_num}")

    # --- Beneficiary Bank Address ---
    bank_address_pattern = r'Bank Address\s*[:\-]?\s*(.+)'
    bank_address_match = re.search(bank_address_pattern, text, re.IGNORECASE)

    if bank_address_match:
        bill_data["Beneficiary Bank Address"] = bank_address_match.group(1).replace('\n', '').strip()
    else:
        print(f" No bank address found on page {page_num}")

    # --- Swift Code ---
    swift_code_pattern = r'Swift Code\s*[:\-]?\s*(\w+)'
    swift_code_match = re.search(swift_code_pattern, text, re.IGNORECASE)

    if swift_code_match:
        bill_data["Beneficiary Swift Code"] = swift_code_match.group(1).strip()
    else:
        print(f" No swift code found on page {page_num}")

    # --- UPI ID ---
    upi_id_pattern = r'UPI ID\s*[:\-]?\s*([\w\d@._-]+)'
    upi_id_match = re.search(upi_id_pattern, text, re.IGNORECASE)

    if upi_id_match:
        bill_data["UPI ID"] = upi_id_match.group(1).strip()
    else:
        print(f" No UPI ID found on page {page_num}")

    # --- GSTIN No ---
    gstin_pattern = r'GSTIN\s*(?:No\s*[:#=_\-]?\s*)?([A-Z0-9]{15}|N/A)'
    gstin_matches = re.findall(gstin_pattern, text, re.IGNORECASE)
    valid_gstins = [g for g in gstin_matches if g != 'N/A' and re.fullmatch(r'[0-9A-Z]{15}', g)]

    if valid_gstins:
        bill_data["GSTIN No"] = ', '.join(valid_gstins)
    else:
        print(f" No valid GSTIN No found on page {page_num}")

    # --- PAN ---
    pan_pattern = r'PAN\s*[:\-]?\s*(\w+)'
    pan_matches = re.findall(pan_pattern, text, re.IGNORECASE)
    valid_pan = None

    for pan in pan_matches:
        pan = pan.strip()
        if pan != "N/A" and re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]$', pan):
            valid_pan = pan
            break

    bill_data["PAN"] = valid_pan if valid_pan else '-'
    if not valid_pan:
        print(f" No valid PAN found on page {page_num}")

    # --- Invoice Date ---
    invoice_date_pattern = r'Invoice Date\s*[:\-]?\s*(.+)'
    invoice_date_matches = re.findall(invoice_date_pattern, text, re.IGNORECASE)

    if invoice_date_matches:
        bill_data["Invoice Date"] = invoice_date_matches[-1].strip()

    # --- Tax Invoice No ---
    tax_invoice_no_pattern = r'Tax Invoice No\s*[:\-]?\s*(.+)'
    tax_invoice_no_matches = re.findall(tax_invoice_no_pattern, text, re.IGNORECASE)

    if tax_invoice_no_matches:
        tax_invoice_no = tax_invoice_no_matches[-1].strip()
        if re.match(r'^[\w\d/-]+$', tax_invoice_no):
            bill_data["Tax Invoice No"] = tax_invoice_no
        else:
            bill_data["Tax Invoice No"] = ''
    else:
        print(f"No Tax Invoice No found on page {page_num}")

    # --- Invoice No ---
    invoice_no_pattern = r'Invoice No\s*[:\-]?\s*(.+)'
    invoice_no_matches = re.findall(invoice_no_pattern, text, re.IGNORECASE)

    if invoice_no_matches:
        for invoice_no in invoice_no_matches:
            invoice_no = invoice_no.strip()
            if re.match(r'^[\w\d/-]+$', invoice_no):
                bill_data["Invoice No"] = invoice_no
                break
    else:
        print(" No Invoice No found")

    # --- Cleanup bank fields ---
    if "Beneficiary Bank Name" in bill_data and "Beneficiary Bank Address" in bill_data["Beneficiary Bank Name"]:
        bill_data["Beneficiary Bank Name"] = bill_data["Beneficiary Bank Name"].split("Beneficiary Bank Address")[0].strip()

    if "Beneficiary Bank Address" in bill_data and "Beneficiary Swift Code" in bill_data["Beneficiary Bank Address"]:
        bill_data["Beneficiary Bank Address"] = bill_data["Beneficiary Bank Address"].split("Beneficiary Swift Code")[0].strip()

    return bill_data

def extract_bill_details(file_path):
    all_bills = []
    final_bill_data = {}

    if file_path.lower().endswith('.pdf'):
        doc = fitz.open(file_path)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")

            if text:
                print("Direct text extract hua hai!")
            
            if not text.strip():
                image_path = f"{UPLOAD_FOLDER}/page_{page_num + 1}.png"
                pix = page.get_pixmap()
                pix.save(image_path)
                text = extract_text_from_image(image_path)

            bill_data = extract_details_from_text(text, page_num + 1)
            all_bills.append(bill_data)

    elif file_path.lower().endswith(('.jpg', '.jpeg', '.png')):
        text = extract_text_from_image(file_path)
        bill_data = extract_details_from_text(text, 1)
        all_bills.append(bill_data)

    elif file_path.lower().endswith(('.xlsx', '.csv')):
        text = extract_text_from_image(file_path)
        bill_data = extract_details_from_text(text, 1)
        all_bills.append(bill_data)

    else:
        logger.error("Unsupported file format")
        return []

    for bill in all_bills:
        for key, value in bill.items():
            if value and key != "Page":
                final_bill_data[key] = value

    return [final_bill_data]


    for bill in all_bills:
        for key, value in bill.items():
            if key not in final_bill_data:
                final_bill_data[key] = value
            elif isinstance(value, str) and value not in final_bill_data[key]:
                final_bill_data[key] += f" | {value}"

    return final_bill_data


def save_to_db(bill_data_list):
    upload_datetime = datetime.now(pytz.timezone('Asia/Kolkata'))

    try:
        with closing(get_db_connection()) as conn:
            with conn.cursor() as cursor:
                for bill in bill_data_list:
                    cursor.execute("""
                        INSERT INTO bill_data (
                            page_number,
                            bill_date,
                            total_amount,
                            bank_name,
                            bank_address,
                            swift_code,
                            upi_id,
                            upload_datetime,
                            invoice_date,
                            tax_invoice_no,
                            gstin_no,
                            pan,
                            customer_vat_reg,
                            company_vat_reg,
                            tax_date,
                            invoice_no,
                            items
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        bill.get("Page"),
                        bill.get("Bill Date"),
                        bill.get("Total Amount"),
                        bill.get("Bank Name"),
                        bill.get("Bank Address"),
                        bill.get("Beneficiary Swift Code"),
                        bill.get("UPI ID"),
                        upload_datetime,
                        bill.get("Invoice Date"),
                        bill.get("Tax Invoice No"),
                        bill.get("GSTIN No"),
                        bill.get("PAN"),
                        bill.get("Customer VAT Reg"),
                        bill.get("Company VAT Reg"),
                        bill.get("Tax Date"),
                        bill.get("Invoice No"),
                        bill.get("Items")
                    ))

                conn.commit()
                logger.info("Data saved to PostgreSQL.")

    except Exception as e:
        logger.error(f"Error saving to PostgreSQL: {e}")

@app.route("/api/ocr", methods=["POST"])
def ocr_handler():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    # Save the file temporarily
    filepath = os.path.join("uploads", file.filename)
    file.save(filepath)

    # Call your OCR function (you can replace this)
    text = run_ocr(filepath)

    return jsonify({"text": text})

def run_ocr(path):
    # Replace this with your actual OCR logic
    return f"Dummy OCR result for {path}"



@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Dummy validation (replace with real DB logic)
    if email == "test@example.com" and password == "password123":
        return jsonify({'status': 'success', 'message': 'Login successful'}), 200
    return jsonify({'status': 'fail', 'message': 'Invalid credentials'}), 401


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    # Store in DB (example only)
    return jsonify({'status': 'success', 'message': f'Registered {name}'}), 201





@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file0' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    files = [request.files[key] for key in request.files.keys()]

    if len(files) > 5:
        return jsonify({'error': 'You can only upload a maximum of 5 files.'}), 400

    all_extracted_data = []

    try:
        for file in files:
            if file.filename == '':
                return jsonify({'error': 'No selected file'}), 400

            if not allowed_file(file.filename):
                return jsonify({'error': 'File type not allowed'}), 400

            file_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(file_path)

            extracted_data = extract_bill_details(file_path)
            save_to_db(extracted_data)

            all_extracted_data.extend(extracted_data)

        return jsonify(all_extracted_data), 200

    except Exception as e:
        logger.error(f"Error uploading files: {e}")
        return jsonify({'error': 'File upload failed'}), 500


@app.route('/entry/<int:id>', methods=['PUT'])
def update_entry(id):
    try:
        with closing(get_db_connection()) as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE bill_data
                    SET 
                        page_number = %s,
                        bill_date = %s,
                        total_amount = %s,
                        bank_name = %s,
                        bank_address = %s,
                        swift_code = %s,
                        upi_id = %s,
                        upload_datetime = %s,
                        invoice_date = %s,
                        tax_invoice_no = %s,
                        gstin_no = %s,
                        pan = %s,
                        customer_vat_reg = %s,
                        company_vat_reg = %s,
                        tax_date = %s,
                        invoice_no = %s,
                        items = %s
                    WHERE id = %s;
                """, (
                    data.get('page_number'),
                    data.get('bill_date'),
                    data.get('total_amount'),
                    data.get('bank_name'),
                    data.get('bank_address'),
                    data.get('swift_code'),
                    data.get('upi_id'),
                    data.get('upload_datetime'),
                    data.get('invoice_date'),
                    data.get('tax_invoice_no'),
                    data.get('gstin_no'),
                    data.get('pan'),
                    data.get('customer_vat_reg'),
                    data.get('company_vat_reg'),
                    data.get('tax_date'),
                    data.get('invoice_no'),
                    data.get('items'),
                    id
                ))
                conn.commit()
        reassign_ids()
        return jsonify({'message': 'Entry updated successfully'}), 200
    except Exception as e:
        logger.error(f"Error updating entry: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/entry/<int:id>', methods=['DELETE'])
def delete_entry(id):
    try:
        with closing(get_db_connection()) as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM bill_data WHERE id = %s;", (id,))
                conn.commit()
        reassign_ids()
        return jsonify({'message': 'Entry deleted successfully'}), 200
    except Exception as e:
        logger.error(f"Error deleting entry: {e}")
        return jsonify({'error': str(e)}), 500 

def reassign_ids():
    try:
        with closing(get_db_connection()) as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id FROM bill_data ORDER BY id;")
                rows = cursor.fetchall()
                for index, row in enumerate(rows):
                    new_id = index + 1
                    old_id = row[0]
                    if new_id != old_id:
                        cursor.execute("UPDATE bill_data SET id = %s WHERE id = %s;", (new_id, old_id))
                conn.commit()
    except Exception as e:
        logger.error(f"Error reassigning IDs: {e}")


@app.route('/entries', methods=['GET'])
def get_entries():
    columns = request.args.getlist('columns')
    if not columns:
        columns = ['id', 'page_number', 'bill_date', 'total_amount', 'bank_name', 'bank_address', 'swift_code', 'upi_id', 'upload_datetime',
                   'invoice_date', 'tax_invoice_no', 'gstin_no', 'pan', 'customer_vat_reg', 'company_vat_reg', 'tax_date', 'invoice_no', 'items']
    try:
        # Corrected how the column names are inserted into the query string
        query = f"SELECT {', '.join(columns)} FROM bill_data"

        with closing(get_db_connection()) as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)
                rows = cursor.fetchall()
                # Fixed typo: 'Fow' → 'row'
                data = [dict(zip(columns, row)) for row in rows]
                return jsonify(data)

    except Exception as e:
        logger.error(f"Error fetching entries: {e}")
        # Fixed invalid dict and return structure
        return jsonify({"error": str(e)}), 500  # Added proper status code

# Corrected: '__main__' was misspelled as '_main_'
if __name__ == '__main__':
    app.run(debug=True)
