# Smart Canteen Pre-Order and Food Waste Management System
## DBMS Lab Project Report & Architecture Documentation

---

### Project Information
* **Project Title:** Smart Canteen Pre-Order and Food Waste Management System
* **Course:** Database Management Systems Lab (Semester V)
* **Team Members:**
  * Sanket Sandeep Kadam (Roll No: 24CE254)
  * Sakshi Satish Desai (Roll No: 24CE251)
* **Technology Stack:** MERN Stack (MongoDB Atlas, Express.js, React.js, Node.js) + Tailwind CSS

---

## 1. Executive Summary & Problem Definition

College canteens face two persistent operational challenges:
1. **Severe Peak-Hour Queue Bottlenecks:** Students and faculty spend 15–25 minutes waiting in queue to order and collect meals between tight lecture periods.
2. **Food Wastage from Speculative Preparation:** Canteen cooks routinely prepare bulk quantities based on intuition or static estimates. Fluctuations in daily attendance or preferences lead to unsold surplus food being discarded daily.

### Proposed Solution
A unified, role-based web application connecting campus consumers with canteen staff:
* **Advance Pre-Ordering:** Students place orders and choose explicit pickup time windows (`12:00–12:15 PM`, `12:15–12:30 PM`, etc.), leveling counter congestion.
* **Just-In-Time Batch Preparation:** Kitchen staff view incoming orders filtered by pickup time slots, preparing food on-demand.
* **Closed-Loop Waste Accounting:** Canteen staff log unsold quantities with granular causes (over-preparation, expiration, customer leftovers) and disposal pathways (composting, biowaste).
* **Inventory Threshold Monitoring:** Automatic alerts for low stock levels and near-expiry raw materials.

---

## 2. System Architecture & Methodology

```
┌────────────────────────────────────────────────────────┐
│                  CLIENT LAYER (React)                  │
│  - React Router v7 (Protected Role Routes)             │
│  - Context API (AuthContext, CartContext)              │
│  - Tailwind CSS + Lucide Icon System                  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│             BACKEND API LAYER (Express.js)             │
│  - JWT Bearer Token Verification Middleware            │
│  - Role Authorization Guard (student/staff/canteen)    │
│  - REST Controllers: /auth, /menu, /orders,           │
│    /inventory, /waste, /feedback                       │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM
                            ▼
┌────────────────────────────────────────────────────────┐
│              DATABASE LAYER (MongoDB Atlas)            │
│  - Collections: Users, MenuItems, Orders,              │
│    Inventories, WasteLogs, Feedbacks                   │
│  - Aggregation Pipelines for Analytics                 │
└────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema & Data Dictionary

### Collection 1: `users`
Stores authenticated users and credentials.
| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique internal identifier |
| `name` | String | Required | Full name of student or staff member |
| `email` | String | Unique, Required | Campus email address |
| `campusId` | String | Indexed | Roll Number (e.g. `24CE254`) or Employee ID |
| `password` | String | Required | Salted bcrypt hash (10 salt rounds) |
| `role` | String | Enum | `'student'`, `'college_staff'`, `'canteen_staff'` |
| `department`| String | Optional | Academic or operational department |
| `createdAt` | Date | Default `now()` | Timestamp of account registration |

### Collection 2: `menuitems`
Stores food catalog and availability.
| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique item identifier |
| `name` | String | Required | Name of dish (e.g. `Masala Dosa`) |
| `description`| String | Optional | Ingredients summary |
| `price` | Number | Min: 0 | Price in Indian Rupees (₹) |
| `category` | String | Enum | `'Breakfast'`, `'Meals & Thali'`, `'Snacks'`, `'Beverages'`, `'Dessert'` |
| `isAvailable`| Boolean | Default: `true` | Real-time availability toggle |
| `icon` | String | Emoji / URL | Visual representation (e.g. `🥞`) |
| `prepTimeMinutes`| Number | Default: 10 | Estimated preparation time in minutes |

### Collection 3: `orders`
Captures pre-order transactions and fulfillment lifecycle.
| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Order document identifier |
| `orderNumber` | String | Unique | Human-readable ID (e.g. `#SC1001`) |
| `user` | ObjectId | Ref: `users` | Foreign reference to ordering user |
| `userName` | String | Denormalized | Name of ordering user for fast display |
| `items` | Array | Embedded Docs | `[{ menuItem, name, price, quantity }]` |
| `totalAmount` | Number | Required | Total order sum in ₹ |
| `pickupSlot` | String | Required | Time window (e.g. `12:15–12:30 PM`) |
| `paymentMethod`| String | Enum | `'Pay at pickup'`, `'UPI'`, `'Debit / Credit card'` |
| `paymentStatus`| String | Enum | `'Due at pickup'`, `'Paid'` |
| `orderStatus` | String | Enum | `'Received'`, `'Preparing'`, `'Ready for Pickup'`, `'Completed'` |
| `createdAt` | Date | Default `now()` | Order creation timestamp |

### Collection 4: `inventories`
Tracks stock levels, thresholds, and shelf life.
| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Inventory document identifier |
| `name` | String | Unique | Ingredient name (e.g. `Tomato`, `Rice`) |
| `currentStock`| Number | Min: 0 | Quantity currently available in store |
| `unit` | String | Enum | `'kg'`, `'packs'`, `'liters'`, `'units'` |
| `reorderThreshold`| Number | Default: 10 | Stock floor triggering low-stock alert |
| `expiryDate` | Date | Required | Ingredient expiration date |
| `status` | String | Computed | `'Stable'`, `'Reorder soon'`, `'Low stock'` |

### Collection 5: `wastelogs`
Logs daily food waste and disposal.
| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Waste entry identifier |
| `item` | String | Required | Discarded food item |
| `quantityKg` | Number | Min: 0.1 | Weight of waste in kilograms |
| `reason` | String | Enum | `'Over-preparation'`, `'Expired'`, `'Leftovers'`, `'Spoiled'` |
| `disposalMethod`| String | Enum | `'Composting'`, `'Biowaste collection'`, `'Other'` |
| `staffName` | String | Required | Staff member logging the entry |
| `loggedBy` | ObjectId | Ref: `users` | Foreign reference to staff account |
| `createdAt` | Date | Default `now()` | Timestamp of logging |

### Collection 6: `feedbacks`
Stores consumer ratings and comments.
| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Feedback identifier |
| `user` | ObjectId | Ref: `users` | Reviewing user |
| `userName` | String | Denormalized | Author display name |
| `orderNumber` | String | Optional | Associated order |
| `itemReviewed`| String | Default | Dish reviewed or `'General Service'` |
| `rating` | Number | 1 to 5 | Star rating |
| `category` | String | Enum | `'Food Quality'`, `'Service Speed'`, `'Cleanliness'`, etc. |
| `comment` | String | Required | Written review text |

---

## 4. API Endpoints Specification

| Method | Endpoint | Access Role | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new student, faculty, or staff account |
| `POST` | `/api/auth/login` | Public | Authenticate and issue JWT token |
| `GET` | `/api/menu` | Public | Fetch available menu items with category filter |
| `POST` | `/api/menu` | `canteen_staff` | Add new dish to menu |
| `PATCH`| `/api/menu/:id/toggle` | `canteen_staff` | Toggle item availability (`Available` vs `Sold Out`) |
| `DELETE`| `/api/menu/:id` | `canteen_staff` | Remove item from menu |
| `POST` | `/api/orders` | `student`, `college_staff` | Place advance pre-order with slot and items |
| `GET` | `/api/orders/my` | Authenticated | View logged-in user's active and historical orders |
| `GET` | `/api/orders` | `canteen_staff` | Kitchen queue with status filtering |
| `PATCH`| `/api/orders/:id/status`| `canteen_staff` | Update lifecycle (`Received` → `Preparing` → `Ready`) |
| `GET` | `/api/orders/analytics/summary`| `canteen_staff` | Daily revenue, order volume, and active counts |
| `GET` | `/api/inventory` | `canteen_staff` | View all ingredient stock levels and alerts |
| `POST` | `/api/inventory` | `canteen_staff` | Register new raw ingredient |
| `PUT` | `/api/inventory/:id` | `canteen_staff` | Restock or adjust ingredient quantity |
| `GET` | `/api/waste` | `canteen_staff` | Cumulative waste, reason distribution, audit log |
| `POST` | `/api/waste` | `canteen_staff` | Record new food waste entry |
| `GET` | `/api/feedback` | Public | View community reviews and calculated average rating |
| `POST` | `/api/feedback` | Authenticated | Submit rating (1–5) and comments |

---

## 5. Security & Data Integrity Measures
1. **Password Encryption:** Passwords are never stored in plaintext; salted `bcryptjs` hashing with 10 salt rounds runs via Mongoose pre-save middleware.
2. **Stateless Authorization:** Authenticated requests transmit an `Authorization: Bearer <JWT>` header verified against a secret key.
3. **Role-Based Access Control (RBAC):** Backend route handlers are shielded with `authorize('canteen_staff')`, terminating unauthorized requests with `403 Forbidden`.
4. **Input Normalization & Sanitization:** Email normalization, quantity limits (`min: 0.1` kg for waste), and bounded rating constraints (`min: 1, max: 5`) prevent corrupted state.

