// Import the 'promise-mysql' module and assign it to the variable 'pmysql'
var pmysql = require('promise-mysql')
// Declare a variable 'pool' to hold the connection pool later
var pool;

// Import the 'mongodb' module and create a MongoDB client
const { MongoClient } = require('mongodb');

// Create a connection pool with specific configuration options
pmysql.createPool({
    connectionLimit: 3,  // Set the maximum number of connections in the pool to 3
    host: 'localhost', // Set the host of the MySQL server
    user: 'root', // Set the username for connecting to the MySQL server
    password: 'root', // Set the password for connecting to the MySQL server
    database: 'proj2023' // Set the name of the MySQL database to be used
})
    .then((p) => {
        pool = p // Assign the created pool to the variable 'pool' upon successful creation
    })
    .catch((e) => {
        console.log("pool error:" + e) // Log an error message if there's an issue creating the pool
    })

// Define a function to retrieve all managers from MongoDB
async function getManagersFromMongo() {
    // MongoDB connection URL and database name
    const url = 'mongodb://localhost:27017';
    const dbName = 'proj2023MongoDB'; 
    // Create a new MongoDB client with specific options
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Establish a connection to the MongoDB server
        await client.connect();
        const db = client.db(dbName);
        // Access the 'managers' collection within the database
        const collection = db.collection('managers'); 
        // Query all documents (manager records) in the 'managers' collection and convert the result to an array
        const managers = await collection.find({}).toArray();
        // Return the array of manager documents
        return managers;
    } catch (err) {
        // Handle any errors that occur during the database operation
        console.error('Error: ', err);
        throw err;
    } finally {
        // Ensure that the MongoDB client connection is closed, whether the operation succeeds or fails
        await client.close();
    }
}

// Define a function 'getStores' that retrieves all records from the 'store' table
function getStores() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM store')
            .then((data) => {
                resolve(data) // Resolve with the retrieved data
            })
            .catch(error => {
                reject(error) // Reject with the encountered error
            })
    })
}

// Define a function 'getStoreById' that retrieves a specific store record by its ID
function getStoreById(storeId) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM store WHERE sid = ?', [storeId])
            .then((data) => {
                if (data.length > 0) {
                    resolve(data[0]); // Resolve with the first record if found
                } else {
                    reject(new Error('Store not found')); // Reject with an error if the store is not found
                }
            })
            .catch(error => {
                reject(error);  // Reject with an error if the store is not found
            });
    });
}

// Define a function 'updateStore' that updates a specific store record by its ID
function updateStore(storeId, updatedStoreData) {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE store SET location = ?, mgrid = ? WHERE sid = ?',
            // Substitute placeholders in the query with actual data
            [updatedStoreData.location, updatedStoreData.mgrid, storeId])
            .then(() => {
                // If the query is successful, resolve the promise without any value
                resolve();
            })
            .catch(error => {
                // If there is an error in the query, reject the promise with the error
                reject(error);
            });
    });
}
// This function represents SQL query that retrieves data from mutiple 
// tables and returns set with specified column aliases
function getProducts() {
    const query = `
    SELECT 
        p.pid AS 'Product ID',
        p.productdesc AS 'Description',
        s.sid AS 'Store ID',
        s.location AS 'Location',
        ps.price AS 'Price'
    FROM 
        product p
    LEFT JOIN 
        product_store ps ON p.pid = ps.pid
    LEFT JOIN 
        store s ON ps.sid = s.sid
    ORDER BY 
        p.pid, s.location;
    `;
    return new Promise((resolve, reject) => {
        pool.query(query, (error, results) => {
            // If there's an error, reject the promise with the error
            if (error) {
                reject(error);
            }
            // If successful, resolve the promise with the query results 
            else {
                resolve(results);
            }
        });
    });
}
// Define a function 'checkIfProductIsSold' to check if a product is sold in any store
function isProductSold(pid) {
    return new Promise((resolve, reject) => {
        // Query to check if the product is present in the 'product_store' table
        const query = 'SELECT * FROM product_store WHERE pid = ?';

        pool.query(query, pid)
            .then((data) => {
                // If the product is found in the 'product_store' table, it means it's sold in a store
                resolve(data);
            })
            .catch(error => {
                // Reject with the encountered error
                reject(error);
            });
    });
}

// Define a function 'deleteProduct' to delete a product by its ID
function deleteProduct(pid) {
    return new Promise((resolve, reject) => {
        // SQL query to delete the product from the 'product' table
        const query = 'DELETE FROM product WHERE pid = ?';

        pool.query(query, [pid])
            .then((result) => {
                // If the delete operation is successful, resolve the promise
                resolve(result);
            })
            .catch(error => {
                // If there is an error during the delete operation, reject the promise
                reject(error);
            });
    });
}

// Define a function to get manager details (both MySQL and MongoDB)
function getManagerDetails() {
    return new Promise((resolve, reject) => {
        var cursor = coll.find()
        cursor.toArray()
            .then((data) => {
                resolve(data); // Resolve without sending any specific data
            })
            .catch(error => {
                reject(error);
            });
    });
}
// Adds new manager to db
function addManager(managerData) {
    return new Promise((resolve, reject) => {
        coll.insertOne(managerData) // Insert the manager data
            .then((result) => {
                resolve(result); // Resolve with the inserted document
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Define a function 'isManagerAssignedToStore' to check if a manager is assigned to another store
function isManagerAssignedToStore(managerId, storeId) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM store WHERE mgrid = ? AND sid != ?', [managerId, storeId])
            .then((data) => {
                if (data.length > 0) {
                    // If the manager is found in another store, resolve with 'true'
                    resolve(true);
                } else {
                    // If the manager is not found in any other store, resolve with 'false'
                    resolve(false);
                }
            })
            .catch(error => {
                // Reject with the encountered error
                reject(error);
            });
    });
}

// Export the defined functions so they can be used in other modules
module.exports = { getStores, getStoreById, updateStore, getProducts, isProductSold, deleteProduct, addManager, getManagerDetails, isManagerAssignedToStore };

