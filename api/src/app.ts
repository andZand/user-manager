import express, {Request, Response} from "express";
import mysql from 'mysql';
import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.API_PORT ?? 3000; // default port is 3000
const app = express();

app.use(compression());
app.use(bodyParser());

// Connect to MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
db.connect(err => {
    if (err) {
        console.error('MySQL connection error:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

app.use(cors({
    credentials: true,
}))

app.listen(port, () => {
    console.log('API server running on http://localhost:' + port + '/');
})

// GET route to retrieve users
app.get('/api/users', (req, res) => {
    //const query = 'SELECT * FROM users, roles.name INNER JOIN roles_users ON users.id = roles_users.user_id INNER JOIN roles ON roles_users.role_id = roles.id; ';
    const query = 'SELECT users.*, GROUP_CONCAT(roles_users.role_id) AS roles\n' +
        'FROM users\n' +
        'LEFT JOIN roles_users ON users.id = roles_users.user_id\n' +
        'GROUP BY users.id;';
    db.query(query, (err, result) => {
        if (err) {
            console.log("Error in MySQL USER Query: " + err.message);
            res.status(500).json({error: 'Error fetching data'});
        } else {
            result.forEach((user:any) => {
                user.roles = user.roles ? user.roles.split(',') : [];
            })
            res.json(result);
        }
    });
});

// POST route to add/edit users
app.post('/api/users', (req: Request, res: Response) => {
    const {id, name, firstname, email, phone, roles} = req.body;
    if (id) {
        // Check if entry with given ID exists
        db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id], (err, result) => {
            if (err) {
                console.log("Error in MySQL USERS SELECT: " + err.message);
                res.status(500).json({error: 'Error checking entry in MySQL'});
            } else {
                if (result.length === 0) {
                    res.status(404).json({error: 'Error 404, entry not found'});
                } else {
                    // Entry exists, update query
                    db.query('UPDATE users SET name = ?, firstname = ?, email = ?, phone = ? WHERE id = ?', [name, firstname, email, phone, id], (err, result) => {
                        if (err) {
                            console.log("Error in MySQL UPDATE USERS: " + err.message);
                            res.status(500).json({error: 'Error saving data'});
                        } else {
                            if (roles) {
                                // has permissions, add to association table
                                db.query('DELETE FROM roles_users where user_id = (?)', [id], (err, result) => {
                                    roles.forEach((role_id: Number) => {
                                        db.query('INSERT INTO roles_users (user_id, role_id) VALUES (?, ?)', [id, role_id], (err, result) => {
                                        });
                                    });
                                });
                            }
                            res.json({message: 'Data saved successfully'});
                        }
                    });
                }
            }
        });
    } else {
        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query('INSERT INTO users (name, firstname, email, phone, created) VALUES (?, ?, ?, ?, ?)', [name, firstname, email, phone, currentTime], (err, result) => {
            if (err) {
                console.log("Error in MySQL USER INSERT: " + err.message);
                res.status(500).json({error: 'Error saving data'});
            } else {
                res.json({message: 'Data saved successfully'});
            }
        });
    }
});


// GET route to retrieve Roles
app.get('/api/roles', (req, res) => {
    const query = 'SELECT roles.*, GROUP_CONCAT(permissions_roles.permission_id) AS permissions\n' +
        'FROM roles\n' +
        'LEFT JOIN permissions_roles ON roles.id = permissions_roles.role_id\n' +
        'GROUP BY roles.id;';
    db.query(query, (err, result) => {
        if (err) {
            console.log("Error in MySQL USER Query: " + err.message);
            res.status(500).json({error: 'Error fetching data'});
        } else {
            result.forEach((role:any) => {
                role.permissions = role.permissions ? role.permissions.split(',') : [];
                console.log(role.permissions);
            })
            res.json(result);
        }
    });
});
// POST route to add/edit Roles
app.post('/api/roles', (req: Request, res: Response) => {
    const {id, name, permissions} = req.body;
    if (id) {
        // Check if entry with given ID exists
        db.query('SELECT * FROM roles WHERE id = ? LIMIT 1', [id], (err, result) => {
            if (err) {
                console.log("Error in MySQL ROLE SELECT: " + err.message);
                res.status(500).json({error: 'Error checking entry in MySQL'});
            } else {
                if (result.length === 0) {
                    res.status(404).json({error: 'Error 404, entry not found'});
                } else {
                    // Entry exists, update query
                    const query = 'UPDATE roles SET name = ? WHERE id = ?';
                    db.query(query, [name, id], (err, result) => {
                        if (err) {
                            console.log("Error in MySQL UPDTAE ROLES: " + err.message);
                            res.status(500).json({error: 'Error saving data'});
                        } else {
                            if (permissions) {
                                // has permissions, add to association table
                                db.query('DELETE FROM permissions_roles where role_id = (?)', [id], (err, result) => {
                                    permissions.forEach((permission_id: Number) => {
                                        db.query('INSERT INTO permissions_roles (permission_id, role_id) VALUES (?, ?)', [permission_id, id], (err, result) => {
                                        });
                                    });
                                });
                            }
                            res.json({message: 'Data saved successfully'});
                        }
                    });
                }
            }
        });
    } else {
        // no entry, insert query
        const query = 'INSERT INTO roles (name) VALUES (?)';
        db.query(query, [name], (err, result) => {
            if (err) {
                console.log("Error in MySQL INSERT ROLES: " + err.message);
                res.status(500).json({error: 'Error saving data'});
            } else {
                res.json({message: 'Data saved successfully'});
            }
        });
    }
});
// DELETE route for Roles
app.delete('/api/roles/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const query = 'DELETE FROM roles where id = (?) LIMIT 1';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.log("Error in MySQL ROLES DELETE: " + err.message);
            res.status(500).json({error: 'Error deleting entry'});
        } else {
            // delete associations
            db.query('DELETE FROM permissions_roles where role_id = (?)', [id], (err, result) => {
                if (err) {
                    console.log("Error in MySQL RIGHTS_ROLES DELETE: " + err.message);
                    res.status(500).json({error: 'Error deleting entry'});
                } else {
                    db.query('DELETE FROM roles_users where role_id = (?)', [id], (err, result) => {
                        if (err) {
                            console.log("Error in MySQL ROLES_USERS DELETE: " + err.message);
                            res.status(500).json({error: 'Error deleting entry'});
                        } else {
                            res.json({message: 'Entry deleted successfully'});
                        }
                    });
                }
            });
        }
    });
});


// GET route to retrieve Permissions
app.get('/api/permissions', (req, res) => {
    const query = 'SELECT * FROM permissions';
    db.query(query, (err, result) => {
        if (err) {
            console.log("Error in MySQL USER Query: " + err.message);
            res.status(500).json({error: 'Error fetching data'});
        } else {
            res.json(result);
        }
    });
});
// POST route to add Permissions
app.post('/api/permissions', (req: Request, res: Response) => {
    const {name} = req.body;
    db.query('INSERT INTO permissions (name) VALUES (?)', [name], (err, result) => {
        if (err) {
            console.log("Error in MySQL RIGHTS INSERT: " + err.message);
            res.status(500).json({error: 'Error saving data'});
        } else {
            res.json({message: 'Data saved successfully'});
        }
    });
});
// DELETE route for Permissions
app.delete('/api/permissions/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    db.query('DELETE FROM permissions where id = (?) LIMIT 1', [id], (err, result) => {
        if (err) {
            console.log("Error in MySQL RIGHTS DELETE: " + err.message);
            res.status(500).json({error: 'Error deleting entry'});
        } else {
            // delete associations
            db.query('DELETE FROM permissions_roles where permission_id = (?)', [id], (err, result) => {
                if (err) {
                    console.log("Error in MySQL RIGHTS_ROLES DELETE: " + err.message);
                    res.status(500).json({error: 'Error deleting entry'});
                } else {
                    res.json({message: 'Entry deleted successfully'});
                }
            });
        }
    });
});
