GigFlow API Documentation

Base URL: http://localhost:5000/api

🛡️ Global Security, Standards & Error Codes

1. Global Authorization Headers

All protected routes require a JSON Web Token (JWT) sent in the headers:

Authorization: Bearer <your_jwt_token>


2. Standard Global Errors

These generic errors can occur across any protected or rate-limited route:

401 Unauthorized (Missing or Invalid Token)

{ "message": "Not authorized, token failed" }


403 Forbidden (Role-Based Access Denied)

{ "message": "Not authorized as an Admin" }


429 Too Many Requests (Rate Limit Exceeded)

{ "message": "Too many requests, please try again later." }


500 Internal Server Error (Database/System Failure)

{ "message": "Server Error" }


🔐 1. User & Authentication Routes

Stricter rate limiting applied: 10 requests per 15 minutes.

User Registration

URL: /auth/register

Method: POST

Access: Public

Request Body:

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "Sales" // Options: "Sales", "Admin"
}


Success Response (201 Created):

{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "60d5ec...",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "Sales"
  }
}


Possible Error Responses:

400 Bad Request (Missing/Malformed Fields):

{ "success": false, "message": "Please provide all required fields as valid text" }


400 Bad Request (Duplicate Username or Email):

{ "success": false, "message": "Username or Email already registered" }


User Login

URL: /auth/login

Method: POST

Access: Public

Request Body:

{
  "username": "johndoe",
  "password": "securepassword"
}


Success Response (200 OK):

{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "60d5ec...",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "Sales"
  }
}


Possible Error Responses:

400 Bad Request (Missing Parameters):

{ "success": false, "message": "Please provide a valid username and password" }


401 Unauthorized (Invalid Credentials / Wrong Password):

{ "success": false, "message": "Invalid credentials" }


Get All Users (Admin Panel)

URL: /auth/

Method: GET

Access: Protected (Admin Only)

Headers: Authorization: Bearer <token>

Success Response (200 OK):

[
  {
    "_id": "60d5ec...",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "Sales"
  }
]


Possible Error Responses:

401 Unauthorized: Token missing or expired.

403 Forbidden: Access attempted by a Sales role user.

Revoke User Access (Delete User)

URL: /auth/:id

Method: DELETE

Access: Protected (Admin Only)

Headers: Authorization: Bearer <token>

Success Response (200 OK):

{ "message": "User access revoked successfully" }


Possible Error Responses:

404 Not Found (User ID does not exist):

{ "message": "User not found" }


403 Forbidden: User role is not authorized to delete system accounts.

📊 2. Leads Management Routes

Standard rate limiting applied: 100 requests per 15 minutes.

Get All Leads (With Advanced Filtering & Pagination)

URL: /leads

Method: GET

Access: Protected (Sales & Admin)

Headers: Authorization: Bearer <token>

Query Parameters (Optional):

page: Page number (default: 1)

limit: Records per page (default: 10)

search: Case-insensitive search string matching lead name or email

status: Filter by Status (New, Contacted, Qualified, Won, Lost)

source: Filter by Source (Website, Instagram, Referral)

sort: Sort results (Newest, Oldest, A-Z, Z-A)

Success Response (200 OK):

{
  "success": true,
  "data": [
    {
      "_id": "60d5ec...",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "phone": "555-0192",
      "status": "Qualified",
      "source": "Website",
      "notes": "Interested in premium tier.",
      "createdAt": "2026-05-18T10:00:00Z"
    }
  ],
  "metadata": {
    "totalRecords": 45,
    "currentPage": 1,
    "totalPages": 5,
    "itemsPerPage": 10
  }
}


Possible Error Responses:

401 Unauthorized: Invalid or missing Bearer token.

Create a New Lead

URL: /leads

Method: POST

Access: Protected (Sales & Admin)

Headers: Authorization: Bearer <token>

Request Body:

{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "phone": "555-0192",
  "status": "New",
  "source": "Website",
  "notes": "Interested in premium tier."
}


Success Response (201 Created):

{
  "_id": "60d5ec...",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "phone": "555-0192",
  "status": "New",
  "source": "Website",
  "notes": "Interested in premium tier.",
  "createdAt": "2026-05-18T10:05:00Z"
}


Possible Error Responses:

400 Bad Request (Validation Failed / Missing Mandatory Fields):

{ "message": "Lead validation failed: email: Path `email` is required." }


Update a Lead

URL: /leads/:id

Method: PUT

Access: Protected (Sales & Admin)

Headers: Authorization: Bearer <token>

Request Body: Any partial subset of Lead fields to modify.

{
  "status": "Qualified"
}


Success Response (200 OK):

{
  "_id": "60d5ec...",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "phone": "555-0192",
  "status": "Qualified",
  "source": "Website",
  "notes": "Interested in premium tier."
}


Possible Error Responses:

404 Not Found (Target Lead ID doesn't exist):

{ "message": "Lead not found" }


400 Bad Request (Invalid payload modifications):

{ "message": "Database update failed: Invalid details" }


Delete a Lead

URL: /leads/:id

Method: DELETE

Access: Protected (Admin Only)

Headers: Authorization: Bearer <token>

Success Response (200 OK):

{ "message": "Lead successfully deleted" }


Possible Error Responses:

404 Not Found (Lead ID doesn't exist):

{ "message": "Lead not found" }


403 Forbidden (Unauthorized user role):

{ "message": "Not authorized as an Admin" }
