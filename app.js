const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database('employees.db');

// Create employees table if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    date_of_birth DATE,
    age INTEGER,
    salary REAL
  )`);
});

// Get all employees from the employees table
app.get('/employees', (req, res) => {
  db.all('SELECT * FROM employees', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(rows);
    }
  });
});

// Create an employee in the employee table
app.post('/employees', (req, res) => {
  const { name, date_of_birth, age, salary } = req.body;

  // Validate input
  if (!isValidName(name) || !isValidDate(date_of_birth) || !isValidAge(age) || !isValidSalary(salary)) {
    return res.status(400).send('Invalid input data');
  }

  db.run('INSERT INTO employees (name, date_of_birth, age, salary) VALUES (?, ?, ?, ?)', [name, date_of_birth, age, salary], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send('Employee created successfully');
    }
  });
});

// Update an employee into the employee table
app.put('/employees/:id', (req, res) => {
  const id = req.params.id;
  const { name, date_of_birth, age, salary } = req.body;

  // Validate input
  if (!isValidName(name) || !isValidDate(date_of_birth) || !isValidAge(age) || !isValidSalary(salary)) {
    return res.status(400).send('Invalid input data');
  }

  db.run('UPDATE employees SET name=?, date_of_birth=?, age=?, salary=? WHERE id=?', [name, date_of_birth, age, salary, id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send('Employee updated successfully');
    }
  });
});

// Delete an employee from the employee table
app.delete('/employees/:id', (req, res) => {
  const id = req.params.id;

  db.run('DELETE FROM employees WHERE id=?', [id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send('Employee deleted successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Validation function for name
function isValidName(name) {
  return /^[a-zA-Z]+$/.test(name);
}

// Validation function for date
function isValidDate(date) {
  return !isNaN(Date.parse(date));
}

// Validation function for age
function isValidAge(age) {
  return !isNaN(parseInt(age, 10)) && parseInt(age, 10) > 0;
}

// Validation function for salary
function isValidSalary(salary) {
  return !isNaN(parseFloat(salary)) && parseFloat(salary) > 0;
}
