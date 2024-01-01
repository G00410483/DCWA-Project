Node.js Express Application with MySQL and MongoDB

Overview
This application is a web server built using Express.js. It features integration with both MySQL and MongoDB databases and uses EJS as its template engine for rendering HTML.

Features
Home Page: Displays links to various sections (Stores, Products, Managers).
Stores Management: Allows viewing, editing, and updating store details.
Product Management: Displays products, allows deletion of products not sold in stores.
Manager Management: Enables viewing managers, adding new managers, and ensuring data validation.

Application Structure
Database Connections:
Connects to MySQL and MongoDB databases.
Uses promise-mysql for MySQL and native MongoDB client.
Route Handlers:
Home (/): Renders the home page.
Stores (/stores, /stores/edit/:sid): Handles viewing and editing stores.
Products (/products, /products/delete/:pid): Manages product listing and deletion.
Managers (/managers, /managers/add): Displays managers and adds new managers.
Error Handling:
Includes error handling for database operations and form validations.

EJS Views
Utilizes EJS templates for rendering HTML.
Contains forms for adding and updating data with appropriate validations.
