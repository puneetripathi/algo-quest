# Information from the docs

1. IndexedDB databases store key-value pairs. The values can be complex structured objects, and keys can be properties of those
   objects. You can create indexes that use any property of the objects for quick searching, as well as sorted enumeration. Keys
   can be binary objects.
2. IndexedDB is built on a transactional database model. Everything you do in IndexedDB always happens in the context of
   a transaction.
3. You cannot execute commands or open cursors outside of a transaction. Transactions have a well-defined lifetime, so attempting
   to use a transaction after it has completed throws exceptions. Also, transactions auto-commit if no new requests are made when
   the transaction is active.
4. This transaction model is really useful when you consider what might happen if a user opened two instances of your web app in
   two different tabs simultaneously. Without transactional operations, the two instances could interfere with each other's
   modifications.
5. The IndexedDB API is mostly asynchronous. The API doesn't give you data by returning values; instead, you have to pass a callback
   function. You don't "store" a value into the database, or "retrieve" a value out of the database through synchronous means.
   Instead, you "request" that a database operation happens. You get notified by a DOM event when the operation finishes, and the
   type of event you get lets you know if the operation succeeded or failed.
6. IndexedDB uses a lot of requests. Requests are objects that receive the success or failure DOM events that were mentioned
   previously. They have onsuccess and onerror properties, and you can call addEventListener() and removeEventListener() on them.
   They also have readyState, result, and errorCode properties that tell you the status of the request. The result property is
   particularly magical, as it can be many different things, depending on how the request was generated
7. IndexedDB uses DOM events to notify you when results are available. DOM events always have a type property (in IndexedDB,
   it is most commonly set to "success" or "error").
8. IndexedDB is object-oriented. IndexedDB is not a relational database with tables representing collections of rows and columns.
   This important and fundamental difference affects the way you design and build your applications.
9. IndexedDB does not use Structured Query Language (SQL). It uses queries on an index that produces a cursor, which you use to
   iterate across the result set. Its a NoSQL system
10. IndexedDB adheres to a same-origin policy. An origin is the domain, application layer protocol, and port of a URL of the
    document where the script is being executed. Each origin has its own associated set of databases. Every database has a name
    that identifies it within an origin.
11. The API is not designed to take care of synchronizing with a server-side database. You have to write code that synchronizes
    a client-side indexedDB database with a server-side database.
12. Full text searching. The API does not have an equivalent of the LIKE operator in SQL.
13. Data can be deleted in events such as, user requests a wipe out. Many browsers have settings that let users wipe all data
    stored for a given website, including cookies, bookmarks, stored passwords, and IndexedDB data.

## Core terminology

1. **database**: A repository of information, typically comprising one or more object stores. Each database must have the following:
   name and version (update with every subsequent update)
2. **database connection**: An operation created by opening a database. A given database can have multiple connections at the
   same time.
3. **durable**: In Firefox, IndexedDB used to be durable, meaning that in a readwrite transaction a complete event was fired only
   when all data was guaranteed to have been flushed to disk. As of now durablity constraints are relaxed in order to give more
   speed to the app.
4. **index**: An index is a specialized object store for looking up records in another object store, called the referenced object
   store. The index is a persistent key-value storage where the value part of its records is the key part of a record in the
   referenced object store. The records in an index are automatically populated whenever records in the referenced object store
   are inserted, updated, or deleted. Each record in an index can point to only one record in its referenced object store, but
   several indexes can reference the same object store. When the object store changes, all indexes that refer to the object store
   are automatically updated. Alternatively, you can also look up records in an object store using the key.
5. **object store**: The mechanism by which data is stored in the database. The object store persistently holds records, which are
   key-value pairs. Records within an object store are sorted according to the keys in an ascending order. Every object store must
   have a name that is unique within its database.
6. **request**: The operation by which reading and writing on a database is done. Every request represents one read or write operation.
7. **transaction**: An atomic set of data-access and data-modification operations on a particular database. It is how you interact
   with the data in a database. In fact, any reading or changing of data in the database must happen in a transaction.
   A database connection can have several active transactions associated with it at a time, so long as the writing transactions
   do not have overlapping scopes. The scope of transactions, which is defined at creation, determines which object stores the
   transaction can interact with and remains constant for the lifetime of the transaction. So, for example, if a database connection
   already has a writing transaction with a scope that just covers the flyingMonkey object store, you can start a second transaction
   with a scope of the unicornCentaur and unicornPegasus object stores. As for reading transactions, you can have several of
   them — even overlapping ones.
   Transactions are expected to be short-lived, so the browser can terminate a transaction that takes too long, in order to free
   up storage resources that the long-running transaction has locked. You can abort the transaction, which rolls back the changes
   made to the database in the transaction. And you don't even have to wait for the transaction to start or be active to abort it.
   The three modes of transactions are: readwrite, readonly, and versionchange. The only way to create and delete object stores
   and indexes is by using a versionchange transaction.
8. **version**: When a database is first created, its version is the integer 1. Each database has one version at a time; a database
   can't exist in multiple versions at once. The only way to change the version is by opening it with a greater version than the
   current one.

## How to use indexedDB?

- **Setup connection**: const request = window.indexedDB.open("MyTestDatabase", 3); // returns success or failure. It is a asynchronous request
- If the database does not exist, it calls onupgradeneeded() method. If a newer version then it will upgrade the database. Version of database is long long int therefore no float values allowed such as 2.3 or 1.7.5

`
request.onerror = function (event) {
console.log("Why didn't you allow my web app to use IndexedDB?!");
};

request.onsuccess = function (event) {
const db = request.result;
console.log("success: " + db);
};
`

- Handle success or error events for the request that returns a IDBOpenDBRequest object

- **Handle the open connection**: If the connection was established use the results to process data, for CRUD applications

`let db;
const request = indexedDB.open("MyTestDatabase");
request.onerror = (event) => {
  console.error("Why didn't you allow my web app to use IndexedDB?!");
};
request.onsuccess = (event) => {
  db = event.target.result;
};`

- event.target.result is the entry point for database.
- Error in transaction bubbles to the top therefore if you want to handle errors, you can go ahead and use only one error handling block

## Handle version upgrade

- When you create a new database or increase the version number of an existing database (by specifying a higher version number than you did previously, when Opening a database), the onupgradeneeded event will be triggered and an IDBVersionChangeEvent object will be passed to any onversionchange event handler

`
// This event is only implemented in recent browsers
request.onupgradeneeded = (event) => {
// Save the IDBDatabase interface
const db = event.target.result;

// Create an objectStore for this database
const objectStore = db.createObjectStore("name", { keyPath: "myKey" });
};
`

- In this case, the database will already have the object stores from the previous version of the database, so you do not have to create these object stores again. You only need to create any new object stores, or delete object stores from the previous version that are no longer needed. If you need to change an existing object store (e.g., to change the keyPath), then you must delete the old object store and create it again with the new options. (Note that this will delete the information in the object store! If you need to save that information, you should read it out and save it somewhere else before upgrading the database.)
- You can also create indices on any object store, provided the object store holds objects, not primitives. An index lets you look up the values stored in an object store using the value of a property of the stored object, rather than the object's key.
- Additionally, indexes have the ability to enforce simple constraints on the stored data. By setting the unique flag when creating the index, the index ensures that no two objects are stored with both having the same value for the index's key path. So, for example, if you have an object store which holds a set of people, and you want to ensure that no two people have the same email address, you can use an index with the unique flag set to enforce this.

- **Setup a new version of database with index**:

`
const dbName = "the_name";

const request = indexedDB.open(dbName, 2);

request.onerror = (event) => {
// Handle errors.
};
request.onupgradeneeded = (event) => {
const db = event.target.result;

// Create an objectStore to hold information about our customers. We're
// going to use "ssn" as our key path because it's guaranteed to be
// unique - or at least that's what I was told during the kickoff meeting.
const objectStore = db.createObjectStore("customers", { keyPath: "ssn" });

// Create an index to search customers by name. We may have duplicates
// so we can't use a unique index.
objectStore.createIndex("name", "name", { unique: false });

// Create an index to search customers by email. We want to ensure that
// no two customers have the same email, so use a unique index.
objectStore.createIndex("email", "email", { unique: true });

// Use transaction oncomplete to make sure the objectStore creation is
// finished before adding data into it.
objectStore.transaction.oncomplete = (event) => {
// Store values in the newly created objectStore.
const customerObjectStore = db
.transaction("customers", "readwrite")
.objectStore("customers");
customerData.forEach((customer) => {
customerObjectStore.add(customer);
});
};
};
`

- As indicated previously, onupgradeneeded is the only place where you can alter the structure of the database. In it, you can create and delete object stores and build and remove indices.
- Object stores are created with a single call to createObjectStore(). The method takes a name of the store, and a parameter object. Even though the parameter object is optional, it is very important, because it lets you define important optional properties and refine the type of object store you want to create. In our case, we've asked for an object store named "customers" and defined a keyPath, which is the property that makes an individual object in the store unique. That property in this example is "ssn" since a social security number is guaranteed to be unique. "ssn" must be present on every object that is stored in the objectStore.
- We've also asked for an index named "name" that looks at the name property of the stored objects. As with createObjectStore(), createIndex() takes an optional options object that refines the type of index that you want to create. Adding objects that don't have a name property still succeeds, but the objects won't appear in the "name" index.

## Adding, retrieving, and removing data

- Before you can do anything with your new database, you need to start a transaction. Transactions come from the database object, and you have to specify which object stores you want the transaction to span. Once you are inside the transaction, you can access the object stores that hold your data and make your requests. Next, you need to decide if you're going to make changes to the database or if you just need to read from it. Transactions have three available modes: readonly, readwrite, and versionchange.

- To change the "schema" or structure of the database—which involves creating or deleting object stores or indexes—the transaction must be in versionchange mode. This transaction is opened by calling the IDBFactory.open method with a version specified.

- To read the records of an existing object store, the transaction can either be in readonly or readwrite mode. To make changes to an existing object store, the transaction must be in readwrite mode. You open such transactions with IDBDatabase.transaction. The method accepts two parameters: the storeNames (the scope, defined as an array of object stores that you want to access) and the mode (readonly or readwrite) for the transaction. The method returns a transaction object containing the IDBIndex.objectStore method, which you can use to access your object store. By default, where no mode is specified, transactions open in readonly mode.

- When defining the scope, specify only the object stores you need. This way, you can run multiple transactions with non-overlapping scopes concurrently.

- Only specify a readwrite transaction mode when necessary. You can concurrently run multiple readonly transactions with overlapping scopes, but you can have only one readwrite transaction for an object store. To learn more, see the definition for transaction in the IndexedDB key characteristics and basic terminology article.

- **Adding data to database**:

`const transaction = db.transaction(["customers"], "readwrite");
// Note: Older experimental implementations use the deprecated constant IDBTransaction.READ_WRITE instead of "readwrite".
// In case you want to support such an implementation, you can write:
// const transaction = db.transaction(["customers"], IDBTransaction.READ_WRITE);`

- Now that you have a transaction you need to understand its lifetime. Transactions are tied very closely to the event loop. If you make a transaction and return to the event loop without using it then the transaction will become inactive. The only way to keep the transaction active is to make a request on it. When the request is finished you'll get a DOM event and, assuming that the request succeeded, you'll have another opportunity to extend the transaction during that callback. If you return to the event loop without extending the transaction then it will become inactive, and so on. As long as there are pending requests the transaction remains active. Transaction lifetimes are really very simple but it might take a little time to get used to. A few more examples will help, too. If you start seeing TRANSACTION_INACTIVE_ERR error codes then you've messed something up.

- Transactions can receive DOM events of three different types: error, abort, and complete. We've talked about the way that error events bubble, so a transaction receives error events from any requests that are generated from it. A more subtle point here is that the default behavior of an error is to abort the transaction in which it occurred. Unless you handle the error by first calling stopPropagation() on the error event then doing something else, the entire transaction is rolled back. This design forces you to think about and handle errors, but you can always add a catchall error handler to the database if fine-grained error handling is too cumbersome. If you don't handle an error event or if you call abort() on the transaction, then the transaction is rolled back and an abort event is fired on the transaction. Otherwise, after all pending requests have completed, you'll get a complete event. If you're doing lots of database operations, then tracking the transaction rather than individual requests can certainly aid your sanity.

- Now that you have a transaction, you'll need to get the object store from it. Transactions only let you have an object store that you specified when creating the transaction. Then you can add all the data you need.

`
// Do something when all the data is added to the database.
transaction.oncomplete = (event) => {
console.log("All done!");
};

transaction.onerror = (event) => {
// Don't forget to handle errors!
};

const objectStore = transaction.objectStore("customers");
customerData.forEach((customer) => {
const request = objectStore.add(customer);
request.onsuccess = (event) => {
// event.target.result === customer.ssn;
};
});
`

- **Removing data from database**:

`const request = db
  .transaction(["customers"], "readwrite")
  .objectStore("customers")
  .delete("444-44-4444");
request.onsuccess = (event) => {
  // It's gone!
};`

- **Fetch data from database**:

`
const transaction = db.transaction(["customers"]);
const objectStore = transaction.objectStore("customers");
const request = objectStore.get("444-44-4444");
request.onerror = (event) => {
  // Handle errors!
};
request.onsuccess = (event) => {
  // Do something with the request.result!
  console.log(`Name for SSN 444-44-4444 is ${request.result.name}`);
};
`

or you ca also use

`
db
  .transaction("customers")
  .objectStore("customers")
  .get("444-44-4444").onsuccess = (event) => {
  console.log(`Name for SSN 444-44-4444 is ${event.target.result.name}`);
};
`

- See how this works? Since there's only one object store, you can avoid passing a list of object stores you need in your transaction and just pass the name as a string. Also, you're only reading from the database, so you don't need a "readwrite" transaction. Calling transaction() with no mode specified gives you a "readonly" transaction. Another subtlety here is that you don't actually save the request object to a variable. Since the DOM event has the request as its target you can use the event to get to the result property.

- **Update data in database**:
  `
  const objectStore = db
  .transaction(["customers"], "readwrite")
  .objectStore("customers");
  const request = objectStore.get("444-44-4444");
  request.onerror = (event) => {
  // Handle errors!
  };
  request.onsuccess = (event) => {
  // Get the old value that we want to update
  const data = event.target.result;

  // update the value(s) in the object that you want to change
  data.age = 42;

  // Put this updated object back into the database.
  const requestUpdate = objectStore.put(data);
  requestUpdate.onerror = (event) => {
  // Do something with the error
  };
  requestUpdate.onsuccess = (event) => {
  // Success - the data is updated!
  };
  };
  `
