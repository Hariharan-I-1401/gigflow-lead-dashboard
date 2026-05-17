# 📡 API Documentation

Base URL for all endpoints: `http://localhost:5000/api`

## 🔐 Authentication & Authorization
All protected routes require a JSON Web Token (JWT). The token must be sent in the request headers:
`Authorization: Bearer <your_jwt_token>`

Roles are strictly enforced (Sales User vs. Admin) via RBAC middleware.

---

## 🧑‍💻 1. User & Authentication Routes

### Register a New User
* **URL:** `/auth/register`
* **Method:** `POST`
* **Access:** Public (or Admin-only based on configuration)
* **Request Body:**
    ```json
    {
      "username": "johndoe",
      "email": "john@example.com",
      "password": "securepassword",
      "role": "Sales" // Options: "Sales", "Admin"
    }
    ```
* **Success Response (201 Created):** Returns user object and JWT token.

### User Login
* **URL:** `/auth/login`
* **Method:** `POST`
* **Access:** Public
* **Request Body:**
    ```json
    {
      "username": "johndoe",
      "password": "securepassword"
    }
    ```
* **Success Response (200 OK):** Returns user object and JWT token.

### Get All Users (Admin Panel)
* **URL:** `/auth/`
* **Method:** `GET`
* **Access:** Protected (Admin Only)
* **Success Response (200 OK):** Returns an array of all registered system users (excluding passwords).

### Revoke User Access
* **URL:** `/auth/:id`
* **Method:** `DELETE`
* **Access:** Protected (Admin Only)
* **Success Response (200 OK):** `{ "message": "User access revoked successfully" }`

---

## 📈 2. Leads Management Routes

### Get All Leads (With Advanced Filtering & Pagination)
* **URL:** `/leads`
* **Method:** `GET`
* **Access:** Protected (Sales & Admin)
* **Query Parameters (Optional):**
    * `page`: Page number (default: 1)
    * `limit`: Records per page (default: 10)
    * `search`: Search string matching `name` or `email`
    * `status`: Exact match (e.g., `New`, `Qualified`)
    * `source`: Exact match (e.g., `Website`, `Instagram`)
    * `sort`: `Newest`, `Oldest`, `A-Z`, `Z-A`
* **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "60d5ec...",
          "name": "Alice Smith",
          "email": "alice@example.com",
          "status": "Qualified",
          "source": "Website",
          "createdAt": "2023-10-25T10:00:00Z"
        }
      ],
      "metadata": {
        "totalRecords": 45,
        "currentPage": 1,
        "totalPages": 5,
        "itemsPerPage": 10
      }
    }
    ```

### Create a New Lead
* **URL:** `/leads`
* **Method:** `POST`
* **Access:** Protected (Sales & Admin)
* **Request Body:**
    ```json
    {
      "name": "Alice Smith",
      "email": "alice@example.com",
      "phone": "555-0192",
      "status": "New",
      "source": "Website",
      "notes": "Interested in premium tier."
    }
    ```
* **Success Response (201 Created):** Returns the newly created Lead object.

### Update a Lead
* **URL:** `/leads/:id`
* **Method:** `PUT`
* **Access:** Protected (Sales & Admin)
* **Request Body:** Any subset of Lead fields (e.g., just updating `"status"`).
* **Success Response (200 OK):** Returns the updated Lead object.

### Delete a Lead
* **URL:** `/leads/:id`
* **Method:** `DELETE`
* **Access:** Protected (Admin Only)
* **Success Response (200 OK):** `{ "message": "Lead deleted successfully" }`