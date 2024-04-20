const express = require("express");
const mysql = require("mysql2");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const inquirer = require("inquirer");
const fs = require("fs");

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "0706",
    database: "company_db",
  },
  console.log(`Connected to the company_db database.`)
);

function viewAllDepartments() {
  console.log('View all departments');
  const sql = `SELECT id, name AS departments FROM department`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table(result);
  });
}

function viewAllRoles() {
  console.log('View all roles');

  const sql = 
  `SELECT department.name AS department,
  title AS jobTitle, 
  role.id AS roleId, 
  salary 
  FROM role 
  LEFT JOIN department 
  ON role.department_id = department.id 
  ORDER BY role.id;`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table(result);
  });
}

function viewAllEmployees() {
  console.log('View all employees');

  const sql = 
  `SELECT 
  employee.id AS employId, 
  first_name AS firstName, 
  last_name AS lastName,
  role.title AS jobTitle,
  role.salary AS salaries,
  department.name AS department,
  manager_id AS managerReportTo
  FROM employee 
  LEFT JOIN role
  ON employee.role_id = role.id
  LEFT JOIN department 
  ON role.department_id = department.id 
  ORDER BY employee.id;`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table(result);
  });
}

function addADepartment() {
  console.log('Add a department');
  inquirer
  .prompt({
    type: 'input',
    name: 'departmentName',
    message: 'Enter the name of the department:'
  })
  .then(answers => {
    
    const params = answers.departmentName;
    const sql = 
    `INSERT INTO department (name) VALUES (?) `;

    db.query(sql, params, (err, result) => {
      if (err) {
        console.log(err);
      }
      viewAllDepartments()
      console.log('New department ${answer} added successfully!');
    });
  });
}

function addARole() {
  console.log('Add a role');

  db.query('SELECT name FROM department', (err, results) => {
    if (err) {
      console.error('Error querying department names:', err);
      return;
    }
    const departmentNames = results.map(row => row.name);
  
    inquirer
    .prompt([
      {
      type: 'input',
      name: 'roleNameInput',
      message: 'Enter the name of the role:'
      },
      {
      type: 'input',
      name: 'salaryInput',
      message: 'Enter the salary of the role:'
      },
      {
      type: 'list',
      name: 'departmentInput',
      message: 'Select a department:',
      choices: departmentNames
      }])
    
    .then(answers => {
      const selectedDepartmentName = answers.departmentInput;
      db.query(
        'SELECT id FROM department WHERE name = ?',
        [selectedDepartmentName],
        (err, results) => {
          if (err) {
            console.error('Error querying department ID:', err);
            return;
          }
          const selectedDepartmentId = results[0].id;
          const params = [answers.roleNameInput, answers.salaryInput, selectedDepartmentId] ;
          const sql = 
          `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?) `;

          db.query(sql, params, (err, result) => {
            if (err) {
              console.log(err);
            }
            viewAllRoles();
          });
        }
      );
    });
  });
}

function addAEmployee() {
  console.log('Add an employee');

  db.query('SELECT first_name, last_name FROM employee', (err, results) => {
    if (err) {
      console.error('Error querying employee names:', err);
      return;
    }
    const employeeNames = results.map(row => `${row.first_name} ${row.last_name}`);
    const choicesWithNull = [...employeeNames, { name: 'None', value: null }];

    db.query('SELECT title FROM role', (err, results) => {
      if (err) {
        console.error('Error querying employee names:', err);
        return;
      }

      const uniqueRoleTitles = new Set(results.map(row => row.title));
      const roleTitles = Array.from(uniqueRoleTitles);
  
      inquirer
      .prompt([
        {
        type: 'input',
        name: 'firstNameInput',
        message: 'Enter the first name of the new employee:'
        },
        {
        type: 'input',
        name: 'lastNameInput',
        message: 'Enter last name of the new employee:'
        },
        {
          type: 'list',
          name: 'roleInput',
          message: 'Select a role',
          choices: roleTitles
        },
        {
        type: 'list',
        name: 'managerInput',
        message: 'Select a manager:',
        choices: choicesWithNull
        }])
      
      .then(answers => {
        
        const selectedRoleTitle = answers.roleInput;
        const selectedManagerName = answers.managerInput;

        db.query(
          'SELECT id FROM role WHERE title = ?',
          [selectedRoleTitle],
          (err, results) => {
            if (err) {
              console.error('Error querying role ID:', err);
              return;
            }
            const selectedRoleId = results[0].id;

            let selectedManagerId = null;
            if (selectedManagerName) {
              selectedManagerId = employeeNames.indexOf(selectedManagerName) + 1;
            }
  
            const params = [answers.firstNameInput, answers.lastNameInput, selectedRoleId, selectedManagerId] ;
            const sql = 
            `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?) `;

            db.query(sql, params, (err, result) => {
              if (err) {
                console.log(err);
              }
              viewAllEmployees();
            });
          }
        );
      });
    })
  });
}

function updateAnEmployeeRole() {
  console.log('Update an employee role');

  db.query('SELECT first_name, last_name FROM employee', (err, results) => {
    if (err) {
      console.error('Error querying employee names:', err);
      return;
    }
    const employeeNames = results.map(row => `${row.first_name} ${row.last_name}`);

    db.query('SELECT title FROM role', (err, results) => {
      if (err) {
        console.error('Error querying employee names:', err);
        return;
      }

      const uniqueRoleTitles = new Set(results.map(row => row.title));
      const roleTitles = Array.from(uniqueRoleTitles);
  
      inquirer
      .prompt([
        
        {
          type: 'list',
          name: 'selectedNameInput',
          message: 'Select an employee whose title you want to change:',
          choices: employeeNames
        },
        {
        type: 'list',
        name: 'selectedRoleInput',
        message: 'Select a role you want to change to:',
        choices: roleTitles
        }])
      
      .then(answers => {
        const newRole = answers.selectedRoleInput;
        const selectedEmployeeName = answers.selectedNameInput;

        db.query(
          'SELECT id FROM role WHERE title = ?',
          [newRole],
          (err, results) => {
            if (err) {
              console.error('Error querying role ID:', err);
              return;
            }
            const newRoleId = results[0].id;
        
            let selectedEmployeeId = null;
            selectedEmployeeId = employeeNames.indexOf(selectedEmployeeName) + 1;

          const params = [newRoleId, selectedEmployeeId] ;

          const sql = 
          `UPDATE employee SET role_id = ? WHERE id = ? `;

          db.query(sql, params, (err, result) => {
            if (err) {
              console.log(err);
            }
            viewAllEmployees();
          });
        });
      })
    })
  })
};

function startApplication() {
  console.log('Welcome to the Employee Management System!\n');

  inquirer
      .prompt([
          {
              type: 'list',
              name: 'action',
              message: 'What would you like to do?',
              choices: [
                  'View all departments',
                  'View all roles',
                  'View all employees',
                  'Add a department',
                  'Add a role',
                  'Add an employee',
                  'Update an employee role'
              ]
          }
      ])
      .then(answer => {
          if (answer.action === 'View all departments') {
              viewAllDepartments();
          }
          if (answer.action === 'View all roles') {
              viewAllRoles();
          }
          if (answer.action === 'View all employees') {
              viewAllEmployees();
          }
          if (answer.action === 'Add a department') {
              addADepartment();
          }
          if (answer.action === 'Add a role') {
              addARole();
          }
          if (answer.action === 'Add an employee') {
              addAEmployee();
          }
          if (answer.action === 'Update an employee role') {
              updateAnEmployeeRole();
          }
          // Add more conditions for other actions as needed
      });
}

startApplication();

app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
