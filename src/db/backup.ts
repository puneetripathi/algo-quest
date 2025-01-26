import { DATABASE_BACKUP_NAME, DATABASE_NAME } from "~constants/db"

// Function to create a backup (previous code)
const exportBackup = async () => {
  try {
    const backupFileName = DATABASE_BACKUP_NAME // Backup file name

    // Open the database
    const dbRequest = indexedDB.open(DATABASE_NAME)

    dbRequest.onerror = () => {
      console.error("Failed to open the database")
    }

    dbRequest.onsuccess = async (event) => {
      const db = event.target.result

      // Prepare a JSON object to store the backup
      const backupData = {}

      // Get all the object store names
      const objectStoreNames = Array.from(db.objectStoreNames)

      // Iterate through all object stores and fetch their data
      for (const storeName of objectStoreNames) {
        backupData[storeName] = await fetchObjectStoreData(db, storeName)
      }

      // Convert the backup data to a JSON string
      const backupJson = JSON.stringify(backupData, null, 2)

      // Trigger download of the JSON file
      downloadJsonFile(backupFileName, backupJson)
    }
  } catch (error) {
    console.error("Error creating backup:", error)
  }
}

// Helper function to fetch all data from an object store
const fetchObjectStoreData = (db, storeName) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly")
    const objectStore = transaction.objectStore(storeName)
    const request = objectStore.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = (error) => {
      console.error(`Failed to fetch data from store ${storeName}:`, error)
      reject(error)
    }
  })
}

// Helper function to download the JSON file
const downloadJsonFile = (fileName, jsonString) => {
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()

  // Clean up
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Function to import JSON data into IndexedDB (new function)
const importBackup = async (file) => {
  try {
    // Parse the JSON file
    const jsonData = await readJsonFile(file)

    // Open the database
    const dbRequest = indexedDB.open(DATABASE_NAME)

    dbRequest.onerror = () => {
      console.error("Failed to open the database")
    }

    dbRequest.onsuccess = (event) => {
      const db = event.target.result

      // Iterate through all object stores and add data from the JSON
      for (const storeName in jsonData) {
        const storeData = jsonData[storeName]
        pushDataToObjectStore(db, storeName, storeData)
      }

      console.log("Backup imported successfully!")
    }
  } catch (error) {
    console.error("Error importing backup:", error)
  }
}

// Helper function to read the JSON file
const readJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result))
      } catch (error) {
        reject("Failed to parse JSON file.")
      }
    }
    reader.onerror = (error) => reject("Error reading file.")
    reader.readAsText(file)
  })
}

// Helper function to push data to an object store
const pushDataToObjectStore = (db, storeName, storeData) => {
  const transaction = db.transaction(storeName, "readwrite")
  const objectStore = transaction.objectStore(storeName)

  storeData.forEach((data) => {
    objectStore.put(data) // Use `put` to insert or update data
  })

  transaction.oncomplete = () => {
    console.log(`Data added to store ${storeName}`)
  }

  transaction.onerror = (error) => {
    console.error(`Error writing to store ${storeName}:`, error)
  }
}

export { importBackup, exportBackup }
