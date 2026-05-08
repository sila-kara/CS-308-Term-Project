# Online Store Project

## Project Overview

This project was developed for the CS308 Software Engineering course at Sabancı University.

The aim of the project is to design and implement an online shopping platform where customers can browse products, add items to their shopping cart, place orders, track deliveries, write product reviews, give ratings, manage wishlists, and request returns or refunds.

The system also includes management features for product managers and sales managers, allowing them to manage products, stocks, discounts, invoices, deliveries, and customer feedback.

## Purpose

This project was developed for educational purposes as part of the CS308 Software Engineering course. It demonstrates the design and implementation of a role-based online shopping system with customer, product manager, and sales manager functionalities.

## Team Members

- Ada Boran Yılmaz
- Sıla Kara
- Melisa Ece Yıldırım
- Zeynep Irmak Başarıcı
- Zehra Kanberoğlu
- Simla Tükenmez

---

## Main Features

### Customer Features

- Browse products by category
- Search products by name or description
- Sort products by price or popularity
- Add products to shopping cart
- Add products to wishlist
- Place orders after logging in
- Track order status
- View invoices
- Give ratings to products
- Write product reviews
- Request product returns and refunds

### Product Manager Features

- Add, update, and remove products
- Add and remove product categories
- Manage product stock
- View products to be delivered
- Manage delivery status
- View delivery addresses
- Approve or reject customer comments

### Sales Manager Features

- Set and update product prices
- Apply discounts to selected products
- Notify wishlist users about discounted products
- View invoices within a selected date range
- Export or print invoices
- Calculate revenue and profit/loss
- View sales-related charts

---

## System Roles

The system includes three main user roles:

1. **Customer**  
   Customers can browse products, manage their carts and wishlists, place orders, write reviews, give ratings, and request refunds.

2. **Product Manager**  
   Product managers are responsible for product, category, stock, delivery, and comment approval operations.

3. **Sales Manager**  
   Sales managers are responsible for pricing, discounts, invoice management, revenue calculation, and profit/loss analysis.

---

## Product Information

Each product in the system includes the following information:

- Product ID
- Name
- Model
- Serial number
- Description
- Stock quantity
- Price
- Warranty status
- Distributor information

Products that are out of stock can still be searched and viewed, but they cannot be added to the shopping cart.

---

## Order and Delivery Process

After a customer places an order, the stock quantity of the purchased product is updated automatically. The customer can follow the delivery process through different order statuses:

- Processing
- In transit
- Delivered

The product manager can view delivery-related information and update the delivery status.

---

## Review and Rating System

Customers can give ratings and write comments for products.

Ratings are directly associated with the product, while written comments become visible only after approval by the product manager. This ensures that product feedback is controlled before being displayed publicly.

---

## Wishlist and Discount System

Customers can add products to their wishlists. When a sales manager applies a discount to a product, users who have that product in their wishlist can be notified about the discount.

---

## Return and Refund System

Customers can request a return for previously purchased products within the allowed return period. The sales manager evaluates the refund request. If the return is approved, the product is added back to stock and the refund amount is processed according to the original purchase price.

---

## Security and Reliability

The system is designed with role-based access control so that each user type can only access the features related to their responsibilities.

The project also considers secure handling of user information, payment-related data, invoices, and account details.

---

## Development Process

The project was developed using a Scrum-based process. The team followed sprint planning, sprint reviews, retrospectives, backlog management, bug reporting, and regular development progress tracking throughout the semester.

---

## Course Information

**Course:** CS308 Software Engineering  
**Institution:** Sabancı University  
**Project:** Online Store Project  
