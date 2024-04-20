INSERT INTO department (name)
VALUES ("Management"),
       ("Legal"),
       ("Design"),
       ("Sale");

INSERT INTO role (department_id, title, salary)
VALUES (1, "CEO", "20000"),
       (2, "Lawer","15000"),
       (3, "Design Team Leader", "16000"),
       (4, "Sale Team Leader", "16000"),
       (4, "Sales", "80000"),
       (3, "designer", "10000"),
       (3, "designer", "10000"),
       (3, "designer", "10000");

INSERT INTO employee (role_id, first_name, last_name, manager_id)
VALUES (1, "Shaofen", "Cai", null),
       (2, "Xia", "Lin", null),
       (3, "Ruiqin", "Xiao", null),
       (4, "Aiqin", "Huang", null),
       (5, "Gengxin", "Lin", 4),
       (6, "Xiaomi", "Zhou", 3),
       (7, "Huaer", "Lu", 3),
       (8, "Xiaomi", "Zhou", 3);
       
