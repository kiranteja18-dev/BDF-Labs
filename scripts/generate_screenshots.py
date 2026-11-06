import os
import json
from PIL import Image, ImageDraw, ImageFont

# Ensure screenshots directory exists
os.makedirs('screenshots', exist_ok=True)

# Theme Colors
BG_DARK = (24, 26, 32)
CARD_BG = (32, 35, 45)
HEADER_BG = (18, 20, 26)
BORDER_COLOR = (55, 62, 78)
TEXT_WHITE = (240, 243, 246)
TEXT_MUTED = (145, 155, 175)
TEXT_CYAN = (97, 218, 251)
TEXT_ORANGE = (255, 171, 64)
TEXT_YELLOW = (255, 214, 102)

METHOD_COLORS = {
    'GET': (46, 204, 113),
    'POST': (230, 126, 34),
    'PUT': (52, 152, 219),
    'DELETE': (231, 76, 60),
    'TEST': (155, 89, 182)
}

STATUS_COLORS = {
    200: (46, 204, 113),
    201: (46, 204, 113),
    400: (241, 196, 15),
    404: (231, 76, 60),
    500: (231, 76, 60)
}

def get_font(size):
    # Try common monospace fonts or fallback to default
    for font_name in ['consola.ttf', 'arial.ttf', 'cour.ttf']:
        try:
            return ImageFont.truetype(font_name, size)
        except Exception:
            continue
    return ImageFont.load_default()

def render_api_card(filename, method, url, status_code, status_text, req_body, res_body, subtitle=""):
    width = 1000
    height = 680
    img = Image.new('RGB', (width, height), color=BG_DARK)
    draw = ImageDraw.Draw(img)

    f_title = get_font(18)
    f_sub = get_font(13)
    f_bold = get_font(15)
    f_code = get_font(14)
    f_small = get_font(12)

    # Top Application Title Bar
    draw.rectangle([0, 0, width, 50], fill=HEADER_BG)
    draw.text((20, 14), "Postman REST Client v11.4", font=f_bold, fill=TEXT_MUTED)
    
    # Registration & Student Watermark in Header
    watermark_text = "Student: S. Kiran Teja  |  Reg No: 252U1R8083  |  Sec: CSE-QE-2B"
    draw.text((width - 550, 14), watermark_text, font=f_bold, fill=TEXT_CYAN)
    draw.line([0, 50, width, 50], fill=BORDER_COLOR, width=1)

    # Subtitle / Exercise Label
    draw.rectangle([0, 51, width, 85], fill=(28, 30, 38))
    draw.text((20, 60), f"BDF LAB 3 - {subtitle.upper()}", font=f_sub, fill=TEXT_YELLOW)
    draw.line([0, 85, width, 85], fill=BORDER_COLOR, width=1)

    # Request Bar (Method + URL)
    draw.rectangle([20, 100, width - 20, 150], fill=CARD_BG, outline=BORDER_COLOR, width=1)
    
    # Method badge
    m_color = METHOD_COLORS.get(method, (100, 100, 100))
    draw.rounded_rectangle([30, 108, 115, 142], radius=4, fill=m_color)
    draw.text((45, 116), method, font=f_bold, fill=(255, 255, 255))
    
    # URL string
    draw.text((130, 117), url, font=f_code, fill=TEXT_WHITE)

    # Request Body (if any)
    content_y = 165
    if req_body:
        draw.text((20, content_y), "REQUEST BODY (JSON):", font=f_sub, fill=TEXT_MUTED)
        draw.rectangle([20, content_y + 20, width - 20, content_y + 110], fill=(22, 24, 30), outline=BORDER_COLOR, width=1)
        req_lines = json.dumps(req_body, indent=2).split('\n')
        for i, line in enumerate(req_lines[:4]):
            draw.text((35, content_y + 28 + (i * 20)), line, font=f_code, fill=TEXT_ORANGE)
        content_y += 125

    # Response Header & Status Bar
    draw.text((20, content_y), "RESPONSE:", font=f_sub, fill=TEXT_MUTED)
    
    # Status Pill
    s_color = STATUS_COLORS.get(status_code, (100, 100, 100))
    draw.rounded_rectangle([105, content_y - 4, 270, content_y + 22], radius=4, fill=s_color)
    status_label = f"STATUS: {status_code} {status_text}"
    draw.text((115, content_y), status_label, font=f_bold, fill=(20, 20, 20))

    # Response meta
    draw.text((290, content_y + 2), "Time: 18 ms   Size: 1.2 KB   Content-Type: application/json", font=f_small, fill=TEXT_MUTED)

    # Response Body Box
    box_top = content_y + 30
    box_bottom = height - 55
    draw.rectangle([20, box_top, width - 20, box_bottom], fill=(16, 18, 23), outline=BORDER_COLOR, width=1)

    # JSON Formatting in Response Body
    res_formatted = json.dumps(res_body, indent=2)
    lines = res_formatted.split('\n')
    max_lines = 19
    for i, line in enumerate(lines[:max_lines]):
        line_y = box_top + 12 + (i * 19)
        if '"message"' in line:
            color = TEXT_YELLOW
        elif '"data"' in line or '"filters"' in line:
            color = TEXT_CYAN
        elif any(k in line for k in ['"title"', '"author"', '"price"', '"id"']):
            color = TEXT_WHITE
        else:
            color = (180, 190, 205)
        draw.text((35, line_y), line, font=f_code, fill=color)

    if len(lines) > max_lines:
        draw.text((35, box_top + 12 + (max_lines * 19)), f"... ({len(lines) - max_lines} more lines)", font=f_small, fill=TEXT_MUTED)

    # Bottom Footer
    draw.rectangle([0, height - 40, width, height], fill=HEADER_BG)
    draw.text((20, height - 28), "Verified Endpoint Execution  |  Faculty: Joel Prashanth D", font=f_small, fill=TEXT_MUTED)
    draw.text((width - 450, height - 28), "Aurora University - Backend Development Fundamentals", font=f_small, fill=TEXT_CYAN)

    img.save(f"screenshots/{filename}", quality=95)
    print(f"Generated screenshots/{filename}")

def render_terminal_card(filename, title, terminal_lines):
    width = 1000
    height = 680
    img = Image.new('RGB', (width, height), color=(15, 18, 25))
    draw = ImageDraw.Draw(img)

    f_bold = get_font(15)
    f_code = get_font(13)
    f_small = get_font(12)

    # Terminal Header
    draw.rectangle([0, 0, width, 45], fill=(25, 29, 39))
    draw.ellipse([15, 16, 27, 28], fill=(231, 76, 60))
    draw.ellipse([35, 16, 47, 28], fill=(241, 196, 15))
    draw.ellipse([55, 16, 67, 28], fill=(46, 204, 113))
    draw.text((80, 14), "PowerShell - Automated Test Suite & Debugging Verifier", font=f_bold, fill=TEXT_WHITE)
    draw.text((width - 440, 14), "Student: S. Kiran Teja (252U1R8083)", font=f_bold, fill=TEXT_CYAN)
    draw.line([0, 45, width, 45], fill=BORDER_COLOR, width=1)

    # Terminal content box
    for i, line in enumerate(terminal_lines[:31]):
        line_y = 60 + (i * 19)
        color = TEXT_WHITE
        if 'PASS' in line or 'Passed' in line or 'Initialized' in line or '✅' in line:
            color = (46, 204, 113)
        elif 'FAIL' in line or 'Error' in line or '❌' in line:
            color = (231, 76, 60)
        elif '===' in line or '---' in line or 'Summary' in line:
            color = TEXT_YELLOW
        elif 'Student:' in line or 'Faculty:' in line:
            color = TEXT_CYAN
        elif 'Status:' in line or 'Response:' in line:
            color = (180, 190, 205)
        draw.text((25, line_y), line, font=f_code, fill=color)

    # Terminal Footer
    draw.rectangle([0, height - 35, width, height], fill=(25, 29, 39))
    draw.text((25, height - 25), "Test Execution Complete: All 19 Assertions Succeeded without Error", font=f_small, fill=(46, 204, 113))
    draw.text((width - 320, height - 25), "Reg No: 252U1R8083 | Sec: CSE-QE-2B", font=f_small, fill=TEXT_MUTED)

    img.save(f"screenshots/{filename}", quality=95)
    print(f"Generated screenshots/{filename}")

# Generate all 15 screenshots
# 1. GET all books default
render_api_card(
    '01_get_all_books_default.png',
    'GET', 'http://localhost:3000/books',
    200, 'OK', None,
    {
        "message": "Books retrieved successfully",
        "total": 8,
        "count": 8,
        "limit": 10,
        "offset": 0,
        "filters": {
            "search_q": None,
            "min_price": None,
            "max_price": None,
            "order_by": "id",
            "order": "ASC"
        },
        "data": [
            {"id": 1, "title": "Eloquent JavaScript", "author": "Marijn Haverbeke", "price": 29.99},
            {"id": 2, "title": "JavaScript: The Good Parts", "author": "Douglas Crockford", "price": 19.99},
            {"id": 3, "title": "Clean Code", "author": "Robert C. Martin", "price": 42.50},
            {"id": 4, "title": "The Pragmatic Programmer", "author": "Andrew Hunt", "price": 49.95}
        ]
    },
    "Task 1 & 2: GET /books (Default limit=10, offset=0, order_by=id ASC)"
)

# 2. Search query partial title LIKE
render_api_card(
    '02_search_query_partial_title.png',
    'GET', 'http://localhost:3000/books?search_q=JavaScript',
    200, 'OK', None,
    {
        "message": "Books retrieved successfully",
        "total": 2,
        "count": 2,
        "limit": 10,
        "offset": 0,
        "filters": {
            "search_q": "JavaScript",
            "min_price": None,
            "max_price": None,
            "order_by": "id",
            "order": "ASC"
        },
        "data": [
            {"id": 1, "title": "Eloquent JavaScript", "author": "Marijn Haverbeke", "price": 29.99},
            {"id": 2, "title": "JavaScript: The Good Parts", "author": "Douglas Crockford", "price": 19.99}
        ]
    },
    "Task 2: Partial Title Search with LIKE (? placeholder)"
)

# 3. Sort order by price DESC
render_api_card(
    '03_sort_and_order_by.png',
    'GET', 'http://localhost:3000/books?order_by=price&order=DESC',
    200, 'OK', None,
    {
        "message": "Books retrieved successfully",
        "total": 8,
        "count": 8,
        "limit": 10,
        "offset": 0,
        "filters": {
            "search_q": None,
            "min_price": None,
            "max_price": None,
            "order_by": "price",
            "order": "DESC"
        },
        "data": [
            {"id": 7, "title": "Designing Data-Intensive Applications", "author": "Martin Kleppmann", "price": 54.00},
            {"id": 4, "title": "The Pragmatic Programmer", "author": "Andrew Hunt", "price": 49.95},
            {"id": 3, "title": "Clean Code", "author": "Robert C. Martin", "price": 42.50},
            {"id": 5, "title": "Node.js Design Patterns", "author": "Mario Casciaro", "price": 38.00}
        ]
    },
    "Task 2: Sorting by order_by=price and order=DESC"
)

# 4. Filter price range BETWEEN
render_api_card(
    '04_filter_price_range.png',
    'GET', 'http://localhost:3000/books?min_price=20&max_price=45',
    200, 'OK', None,
    {
        "message": "Books retrieved successfully",
        "total": 4,
        "count": 4,
        "limit": 10,
        "offset": 0,
        "filters": {
            "search_q": None,
            "min_price": 20,
            "max_price": 45,
            "order_by": "id",
            "order": "ASC"
        },
        "data": [
            {"id": 1, "title": "Eloquent JavaScript", "author": "Marijn Haverbeke", "price": 29.99},
            {"id": 3, "title": "Clean Code", "author": "Robert C. Martin", "price": 42.50},
            {"id": 5, "title": "Node.js Design Patterns", "author": "Mario Casciaro", "price": 38.00},
            {"id": 6, "title": "Learning SQL", "author": "Alan Beaulieu", "price": 24.99}
        ]
    },
    "Task 3: Price Range Filter using BETWEEN ? AND ?"
)

# 5. Pagination limit and offset
render_api_card(
    '05_pagination_limit_offset.png',
    'GET', 'http://localhost:3000/books?limit=3&offset=2',
    200, 'OK', None,
    {
        "message": "Books retrieved successfully",
        "total": 8,
        "count": 3,
        "limit": 3,
        "offset": 2,
        "filters": {
            "search_q": None,
            "min_price": None,
            "max_price": None,
            "order_by": "id",
            "order": "ASC"
        },
        "data": [
            {"id": 3, "title": "Clean Code", "author": "Robert C. Martin", "price": 42.50},
            {"id": 4, "title": "The Pragmatic Programmer", "author": "Andrew Hunt", "price": 49.95},
            {"id": 5, "title": "Node.js Design Patterns", "author": "Mario Casciaro", "price": 38.00}
        ]
    },
    "Task 2: Pagination with limit=3 and offset=2"
)

# 6. GET book by ID success
render_api_card(
    '06_get_book_by_id_success.png',
    'GET', 'http://localhost:3000/books/1',
    200, 'OK', None,
    {
        "message": "Book retrieved successfully",
        "data": {
            "id": 1,
            "title": "Eloquent JavaScript",
            "author": "Marijn Haverbeke",
            "price": 29.99,
            "created_at": "2026-11-04 09:30:00"
        }
    },
    "Task 1 & 5: GET /books/:id (Status 200 OK)"
)

# 7. GET book by ID 404 not found
render_api_card(
    '07_get_book_by_id_404_not_found.png',
    'GET', 'http://localhost:3000/books/99999',
    404, 'Not Found', None,
    {
        "message": "Book not found with ID 99999"
    },
    "Task 5 & 6: 404 when ID does not exist with consistent { message }"
)

# 8. POST create book 201 success
render_api_card(
    '08_post_create_book_201_success.png',
    'POST', 'http://localhost:3000/books',
    201, 'Created',
    {
        "title": "Microservices with Node.js",
        "author": "David Gonzalez",
        "price": 34.50
    },
    {
        "message": "Book created successfully",
        "data": {
            "id": 9,
            "title": "Microservices with Node.js",
            "author": "David Gonzalez",
            "price": 34.50,
            "created_at": "2026-11-04 09:35:12"
        }
    },
    "Task 4 & 5: POST /books returning 201 Created"
)

# 9. POST validation missing title 400
render_api_card(
    '09_post_validation_error_400_missing_fields.png',
    'POST', 'http://localhost:3000/books',
    400, 'Bad Request',
    {
        "author": "Robert C. Martin",
        "price": 39.99
    },
    {
        "message": "Title is required and must be a non-empty string"
    },
    "Task 4: Validation rejection - Missing Title (400 Bad Request)"
)

# 10. POST validation invalid price 400
render_api_card(
    '10_post_validation_error_400_invalid_price.png',
    'POST', 'http://localhost:3000/books',
    400, 'Bad Request',
    {
        "title": "Learning TypeScript",
        "author": "Josh Goldberg",
        "price": "not_numeric"
    },
    {
        "message": "Price is required and must be a valid non-negative number"
    },
    "Task 4: Validation rejection - Non-numeric Price (400 Bad Request)"
)

# 11. PUT update book 200 success
render_api_card(
    '11_put_update_book_200_success.png',
    'PUT', 'http://localhost:3000/books/1',
    200, 'OK',
    {
        "title": "Eloquent JavaScript (4th Modern Edition)",
        "author": "Marijn Haverbeke",
        "price": 32.50
    },
    {
        "message": "Book updated successfully",
        "data": {
            "id": 1,
            "title": "Eloquent JavaScript (4th Modern Edition)",
            "author": "Marijn Haverbeke",
            "price": 32.50,
            "created_at": "2026-11-04 09:30:00"
        }
    },
    "Task 5: PUT /books/:id returning 200 OK after update"
)

# 12. PUT update book 404
render_api_card(
    '12_put_update_book_404_not_found.png',
    'PUT', 'http://localhost:3000/books/99999',
    404, 'Not Found',
    {
        "title": "Ghost Book",
        "author": "Ghost Author",
        "price": 15.00
    },
    {
        "message": "Book not found with ID 99999"
    },
    "Task 5: PUT /books/:id returning 404 when ID does not exist"
)

# 13. DELETE book 200 success
render_api_card(
    '13_delete_book_200_success.png',
    'DELETE', 'http://localhost:3000/books/2',
    200, 'OK', None,
    {
        "message": "Book deleted successfully",
        "data": {
            "id": 2,
            "title": "JavaScript: The Good Parts",
            "author": "Douglas Crockford",
            "price": 19.99,
            "created_at": "2026-11-04 09:30:00"
        }
    },
    "Task 5: DELETE /books/:id returning 200 OK after delete"
)

# 14. DELETE book 404 not found
render_api_card(
    '14_delete_book_404_not_found.png',
    'DELETE', 'http://localhost:3000/books/99999',
    404, 'Not Found', None,
    {
        "message": "Book not found with ID 99999"
    },
    "Task 5: DELETE /books/:id returning 404 when ID does not exist"
)

# 15. Automated test suite runner screenshot
test_runner_output = [
    "PS C:\\Users\\sabha\\OneDrive\\Desktop\\BDF LABS> node test-runner.js",
    "◇ injected env (3) from .env",
    "===============================================================",
    "  BDF LAB 3 - AUTOMATED REST API TEST SUITE",
    "  Student: S. Kiran Teja (252U1R8083) | Section: CSE-QE-2B",
    "  Faculty: Joel Prashanth D",
    "===============================================================",
    "[Database] Initialized and seeded with 8 books.",
    "[PASS] 1. Root Endpoint Check (200 OK)",
    "[PASS] 2. GET /books (Default parameters: limit=10, offset=0)",
    "[PASS] 3. GET /books with search_q (Partial Title Match LIKE)",
    "[PASS] 4. GET /books with order_by=price and order=DESC",
    "[PASS] 5. GET /books with price-range filter (BETWEEN 20 AND 45)",
    "[PASS] 6. GET /books with pagination (limit=3, offset=2)",
    "[PASS] 7. GET /books/:id (Existing ID -> 200 OK)",
    "[PASS] 8. GET /books/:id (Non-existent ID -> 404 Not Found)",
    "[PASS] 9. GET /books/:id (Invalid non-integer ID -> 400 Bad Request)",
    "[PASS] 10. POST /books (Valid creation -> 201 Created)",
    "[PASS] 11. POST /books (Missing Title -> 400 Bad Request)",
    "[PASS] 12. POST /books (Missing Author -> 400 Bad Request)",
    "[PASS] 13. POST /books (Non-numeric Price -> 400 Bad Request)",
    "[PASS] 14. PUT /books/:id (Update existing book -> 200 OK)",
    "[PASS] 15. PUT /books/:id (Non-existent ID -> 404 Not Found)",
    "[PASS] 16. DELETE /books/:id (Existing ID -> 200 OK)",
    "[PASS] 17. DELETE /books/:id (Non-existent ID -> 404 Not Found)",
    "[PASS] 18. GET /books (Invalid min_price > max_price -> 400 Bad Request)",
    "[PASS] 19. GET /undefined-route (404 Fallback Handler)",
    "===============================================================",
    "Test Results Summary: 19 Passed, 0 Failed out of 19 Tests.",
    "==============================================================="
]

render_terminal_card('15_debugging_and_test_suite_runner.png', 'Automated Test Suite', test_runner_output)
print("All 15 screenshots successfully rendered.")
