SELECT department.name AS department,
title AS jobTitle, 
role.id AS roleId, 
salary 
FROM role 
LEFT JOIN department 
ON role.department_id = department.id 
ORDER BY role.id;

SELECT 
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
ORDER BY employee.id
;
