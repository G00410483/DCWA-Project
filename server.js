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
    res.render('edit', { store: store, errors: [] });
  } catch (error) {
    // Handle errors by logging and sending a 500 Internal Server Error response
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Update Store - Handle form submission for updating a specific store
app.post('/stores/edit/:sid', async (req, res) => {
  // Extract data from the request parameters
  const storeId = req.params.sid;
  const mgrID = req.body.mgrid;
  const location = req.body.location;
  // Initialize array of errors
  let errorMessages = [];

  // Check if Location is at least 1 character long
  if (location.length < 1) {
    errorMessages.push("Location must be at least 1 character long.");
  }
  // Check if Manager ID is four characters long
  if (mgrID.length !== 4) {
    errorMessages.push("Manager ID must be 4 characters long.");
  }

    // Check if Manager ID exists in MongoDB
    const managerExists = await coll.findOne({ _id: mgrID });
    if (!managerExists) {
      errorMessages.push("Manager ID does not exist.");
    }

  // Check if Manager ID is not assigned to another Store in MySQL
  const isAssigned = await mySQLDAO.isManagerAssignedToStore(mgrID, storeId);
  if (isAssigned) {
    errorMessages.push("Manager ID is already assigned to another store.");
  }

  // If there are no errors, update the store
  if (errorMessages.length === 0) {
    const updatedStoreData = req.body;
    await mySQLDAO.updateStore(storeId, updatedStoreData);
    res.redirect('/stores');
  }
  else {
    // Render the 'edit' view with error messages
    res.render('edit', { store: await mySQLDAO.getStoreById(storeId), errors: errorMessages });
  }
});

// Product page
app.get('/products', async (req, res) => {
  try {
    // Retrieve the list of products from MongoDB
    const products = await mySQLDAO.getProducts(); // Use MongoDB function
    // Render the 'products' view, passing the retrieved products data
    res.render('products', { products: products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
// Delete Product Page
app.get('/products/delete/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
    console.log(pid);
    // Check if the product is sold in any store
    const isSold = await mySQLDAO.isProductSold(pid); // Implement this function

    if(isSold.length != 0) {
      console.log("This product is still in stock. It can't be deleted");
      // Pass the product ID to the EJS file as 'productName'
    res.render('deleteError', { productName: pid });
    }
    else {
      await mySQLDAO.deleteProduct(pid);
      console.log("Product: " + pid + " deleted.");
      res.redirect('/products');
    }
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
    // Display managers in console
    console.log(managers)
    // Render the 'managers' view, passing the retrieved managers data
    res.render('managers', { managers: managers });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/managers/add', async (req, res) => {

  // Render the 'edit' view, passing the retrieved store data and errors to display
  res.render('addManager', { errors: [] });
});

app.post('/managers/add', async (req, res) => {
  try {
    const managerData = req.body; // This contains { managerID, name, salary }
    // Initializing array of errors
    let errorMessages = [];

    // Validate Manager ID length
    if (managerData._id && managerData._id.length !== 4) {
      errorMessages.push("Manager ID must be 4 characters long.");
    }

    // Check for Manager ID uniqueness
    const existingManager = await coll.findOne({ _id: managerData._id });
    if (existingManager) {
      errorMessages.push("Manager ID must be unique.");
    }

    // Validate Name length
    if (managerData.name && managerData.name.length <= 5) {
      errorMessages.push("Name must be more than 5 characters.");
    }

    // Validate Salary range
    const salary = parseInt(managerData.salary, 10); // Convert to integer
    // If salary is 0, less than 30000 or more than 70000
    if (isNaN(salary) || salary < 30000 || salary > 70000) {
      errorMessages.push("Salary must be between 30,000 and 70,000.");
    }

    // If no errors create a new manager and navigate back to managers page
    if (errorMessages.length === 0) {
      // Create a new manager
      const newManagerData = {
        _id: managerData._id, 
        name: managerData.name,
        salary: salary
      };
      await coll.insertOne(newManagerData); // Insert into MongoDB with custom manager fields
      // Redirect to '/managers' when there are no errors
      res.redirect('/managers');
    } else {
      // Render the 'addManager' view with error messages
      res.render('addManager', { errors: errorMessages });
    }

  } catch (error) {
    console.error(error);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
