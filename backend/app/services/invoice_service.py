import re
from datetime import date
from decimal import Decimal

from fastapi import UploadFile


def extract_invoice_data_ocr(file: UploadFile) -> dict:
    content = file.file.read().decode("utf-8", errors="ignore")
    file.file.seek(0)

    result = {
        "vendor_name": None,
        "invoice_number": None,
        "amount": None,
        "invoice_date": None,
        "due_date": None,
    }

    vendor_match = re.search(r"(?:vendor|from|bill to)[\s:]+([A-Za-z0-9\s&.,]+)", content, re.IGNORECASE)
    if vendor_match:
        result["vendor_name"] = vendor_match.group(1).strip()[:100]

    invoice_num_match = re.search(r"(?:invoice|inv)[\s#:]+([A-Z0-9\-]+)", content, re.IGNORECASE)
    if invoice_num_match:
        result["invoice_number"] = invoice_num_match.group(1).strip()

    amount_match = re.search(r"(?:total|amount due|balance)[\s:$]+([0-9,]+\.?\d{0,2})", content, re.IGNORECASE)
    if amount_match:
        try:
            result["amount"] = Decimal(amount_match.group(1).replace(",", ""))
        except Exception:
            pass

    date_pattern = r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b"
    dates = re.findall(date_pattern, content)
    if dates:
        try:
            result["invoice_date"] = date.fromisoformat(dates[0].replace("/", "-"))
        except Exception:
            pass
        if len(dates) > 1:
            try:
                result["due_date"] = date.fromisoformat(dates[1].replace("/", "-"))
            except Exception:
                pass

    return result
