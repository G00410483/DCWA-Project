// Import required modules
var express = require('express')
var mySQLDAO = require('./mySQLDAO')
var app = express()
let ejs = require('ejs');

// Set up EJS as the view engine
app.set('view engine', 'ejs');
// Enable parsing of JSON requests
app.use(express.json());
// Enable parsing of URL-encoded requests
app.use(express.urlencoded({ extended: true }));

let productColl; // Declare a global variable to hold the MongoDB collection for products

const MongoClient = require('mongodb').MongoClient
MongoClient.connect('mongodb://127.0.0.1:27017')
  .then((client) => {
    db = client.db('proj2023MongoDB')
    coll = db.collection('managers')
  })
  .catch((error) => {
    console.log(error.message)
  })

// Home Page
app.get('/', (req, res) => {
  // Render the 'home' view when accessing the root URL
  res.render('home');
});

// Stores Page
app.get('/stores', async (req, res) => {
  try {
    // Retrieve the list of stores from the database
    const stores = await mySQLDAO.getStores();
    // Render the 'stores' view, passing the retrieved stores data
    res.render('stores', { stores: stores });
  } catch (error) {
    // Handle errors by logging and sending a 500 Internal Server Error response
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Edit Store Page - Display form for editing a specific store
app.get('/stores/edit/:sid', async (req, res) => {
  try {
    // Extract store ID from the request parameters
    const storeId = req.params.sid;
    console.log('Requested Store ID:', storeId);
    // Retrieve the specific store from the database using the ID
    const store = await mySQLDAO.getStoreById(storeId);
    console.log('Retrieved Store:', store);

    // Render the 'edit' view, passing the retrieved store data
    res.render('edit', { store: store });
  } catch (error) {
    // Handle errors by logging and sending a 500 Internal Server Error response
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Update Store - Handle form submission for updating a specific store
app.post('/stores/edit/:sid', async (req, res) => {
  try {
    // Extract store ID from the request parameters
    const storeId = req.params.sid;
    console.log('Updating Store ID:', storeId);
    // Extract updated store data from the request body
    const updatedStoreData = req.body;
    console.log('Updated Store Data:', updatedStoreData);
    // Update the store in the database with the new data
    await mySQLDAO.updateStore(storeId, updatedStoreData);
    // Redirect the user back to the 'stores' page after successful update
    res.redirect('/stores');
  } catch (error) {
    console.error(error);
    // Handle errors by logging and sending a 500 Internal Server Error response
    res.status(500).send('Internal Server Error');
  }
});

// Product page
app.get('/products', async (req, res) => {
  try {
    // Retrieve the list of products from MongoDB
    const products = await mySQLDAO.getProducts(); // Use getProducts, not getMongoProducts
    res.render('products', { products: products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Managers Page
app.get('/managers', async (req, res) => {
  try {
    // Retrieve the list of managers from MongoDB
    const managers = await mySQLDAO.getManagerDetails(); // Use MongoDB function
    console.log(managers)
    // Render the 'managers' view, passing the retrieved managers data
    res.render('managers', { managers: managers });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/managers/add', async (req, res) => {
  try {
    // Render the 'edit' view, passing the retrieved store data
    res.render('managers', { managers: managers });
  } catch (error) {
    // Handle errors by logging and sending a 500 Internal Server Error response
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/managers/add', async (req, res) => {
  try {
    
    // Update the store in the database with the new data
    await mySQLDAO.addManager();
    // Redirect the user back to the 'stores' page after successful update
    res.redirect('/managers');
  } catch (error) {
    console.error(error);
    // Handle errors by logging and sending a 500 Internal Server Error response
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
