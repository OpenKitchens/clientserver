const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, 'database.json');

function readDatabase() {
  try {
    const data = fs.readFileSync(databasePath, 'utf8');
    return JSON.parse(data) || {};
  } catch (error) {
    console.error('Failed to read the database:', error);
    return {};
  }
}

function writeDatabase(database) {
  try {
    fs.writeFileSync(databasePath, JSON.stringify(database, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write to the database:', error);
  }
}

function addItem(key, value) {
  const database = readDatabase();
  database[key] = value;
  writeDatabase(database);
}

function getItem(key) {
  const database = readDatabase();
  return database[key] || null;
}

function deleteItem(key) {
  const database = readDatabase();
  if (database[key]) {
    delete database[key];
    writeDatabase(database);
    return true;
  }
  return false;
}

function addToList(key, value) {
  const database = readDatabase();
  if (!Array.isArray(database[key])) {
    database[key] = [];
  }
  database[key].unshift(value);
  writeDatabase(database);
}

module.exports = {
  addItem,
  getItem,
  deleteItem,
  addToList,
};
