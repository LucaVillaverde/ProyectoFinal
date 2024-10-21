const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cron = require('node-cron');
const app = express();
const PORT = 5000;
const host = 'http://pruebita.webhop.me';
// const host = 'http://localhost';
// const host = "http://192.168.0.225";

function validarEntrada(texto) {
    const espaciosContinuos = /\s{2,}/.test(texto);
    return {
        espaciosContinuos,
        empiezaConEspacio: texto.startsWith(' '),
        terminaConEspacio: texto.endsWith(' '),
    };
}


const allowedOrigins = [`${host}:5173`];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  optionsSuccessStatus: 200
};



app.use(cors(corsOptions));
app.use(express.json());

const db = new sqlite3.Database('./BasedeDatos.db');
// const db = new sqlite3.Database('./db.db');

cron.schedule('*/1 * * * *', () => { //Tarea ejecutada cada 1 minuto
    console.log('Ejecutando tarea programada: establecer cookieToken a 0');
    db.run('UPDATE Tokens SET cookieToken = 0 WHERE julianday(\'now\') - julianday(created_at) >= 1', (err) => {
        if (err) {
            return console.error('Error al actualizar cookieToken:', err.message);
        }
        console.log('cookieToken actualizado a 0');
    });
});

app.use(function(req, res, next){
    const redirectURL = '/'; // Ruta a la que deseas redirigir

    // Si la URL contiene '.git', redirigir al inicio
    if (req.url.includes('.git')) {
        return res.redirect(redirectURL);
    }

    // Si no contiene '.git', continuar con la solicitud
    next();
});

app.get('/api/usuarios', (req, res) => {
    db.all('SELECT id_user FROM Users', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});


app.post('/token-register', async (req, res) => {
    const { usernameNH } = req.body;

    // Generador de token
    const generateToken = () => {
        const min = 100;
        const max = 3000;
        let token = '';
        for (let i = 0; i < 300; i++) {
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            token += randomNumber.toString();
        }
        return token;
    };

    try {
        const tokenNH = generateToken();
        const tokenH = await bcrypt.hash(tokenNH, 10);
        const usernameH = await bcrypt.hash(usernameNH, 10); // Asegúrate de pasar la "salt"
        const createdAt = new Date().toISOString();

        db.get('SELECT id_user FROM Users WHERE username = ?', [usernameNH], function (err, row) {
            if (err) {
                return res.status(500).json({ message: "Error interno del servidor al obtener id del usuario." });
            }
            if (!row) {
                return res.status(404).json({ message: "No se ha encontrado el id del usuario." });
            }

            const id_user = row.id_user;
            db.run('INSERT INTO Tokens (username, cookieToken, id_user, created_at) VALUES (?, ?, ?, ?)', [usernameNH, tokenNH, id_user, createdAt], function (err) {
                if (err) {
                    return res.status(500).json({ message: "Error interno del servidor al intentar colocar los datos del registro (Tokens)." });
                }
                return res.status(201).json({
                    message: "Se han colocado los datos exitosamente (Tokens).",
                    tokenH,
                    usernameH,
                    id_user,
                });
            });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error interno del servidor.", error: err.message });
    }
});



app.post('/token-login', async (req, res) => {
    const { usernameNH } = req.body;
    
    // Generador de token
    const generateToken = () => {
        const min = 100;
        const max = 3000;
        let token = '';
        for (let i = 0; i < 300; i++) {
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            token += randomNumber.toString();
        }
        return token;
    };

        try {
            const tokenNH = generateToken();
            const tokenH = await bcrypt.hash(tokenNH, 10)
            const usernameH = await bcrypt.hash(usernameNH, 10);
            const createdAt = new Date().toISOString();

                db.get('SELECT id_user FROM Users WHERE username = ?', [usernameNH], (err, row) => {
                    if (err) {
                        return res.status(500).json({ message: `Error interno del servidor ${usernameNH}.` });
                    }
                    if (!row) {
                        return res.status(404).json({ message: `No hay datos sobre este usuario: ${usernameNH}.` });
                    }

                    const id_user = row.id_user;
                    db.run('UPDATE Tokens SET cookieToken = ?, created_at = ? WHERE username = ?', [tokenNH, createdAt, usernameNH], function (err) {
                        if (err) {
                            return res.status(500).json({ message: "Error interno del servidor." });
                        }
                        return res.status(201).json({
                            message: "Se ha creado el token de la cookie con éxito.",
                            tokenH,
                            usernameH,
                            id_user: id_user,
                        });
                    });
                });
            } catch (err) {
                return res.status(400).json({ message: "Error en los datos proporcionados." });
            }
    }
);




app.get('/api/categorias', (req, res) => {
    const query = 'SELECT category FROM Categories'; // Ajuste en el nombre de la tabla y columna
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener las categorías.' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se han encontrado categorías.' });
        }
        // Unificar todas las categorías en un solo array
        let allCategories = [];
        rows.forEach(row => {
            const categories = row.category.split(','); // Ajuste en el nombre de la columna
            allCategories = allCategories.concat(categories.map(cat => cat.trim())); // Limpiar espacios
        });
        // Eliminar duplicados y devolver la respuesta
        const uniqueCategories = [...new Set(allCategories)];
        res.status(200).json({ categories: uniqueCategories });
    });
});


app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) { // Cambié '&&' a '||' para verificar que ambas variables son necesarias
        return res.status(400).json({ message: 'No se ha indicado un nombre o contraseña.' });
    }

    const passwordQuery = 'SELECT password FROM Users WHERE username = ?';


            db.get(passwordQuery, [username], async (err, row) => {
                if (err) {
                    console.error('Error al buscar la contraseña del usuario:', err.message); // Log adicional
                    return res.status(500).json({ message: 'Error al buscar el usuario. 500' });
                }
                if (!row) {
                    return res.status(404).json({ message: 'Usuario no encontrado. 404' }); // Cambié '400' a '404'
                }
                if (row) {
                    const hashedPasswordDB = row.password;
                    const matchP = await bcrypt.compare(password, hashedPasswordDB);

                    if (matchP) {
                        return res.status(200).json({ message: 'Se ha iniciado sesión con exito.' });
                    }
                }
            });
});


app.post('/api/register', (req, res) => {
    const { usernameR, passwordR, passwordRC } = req.body;

    // Validaciones iniciales
    if (!usernameR || !passwordR || !passwordRC) {
        return res.status(400).json({ message: 'Faltan el nombre de usuario o las contraseñas. 400' });
    }
    if (passwordR !== passwordRC) {
        return res.status(400).json({ message: 'Asegurese de repetir bien la contraseña. 400' });
    }

    const validacionUsuario = validarEntrada(usernameR);
    const validacionPassword = validarEntrada(passwordR);


    if (validacionUsuario.empiezaConEspacio || validacionPassword.empiezaConEspacio) {
        return res.status(400).json({ message: 'No pueden iniciar con un espacio. 400' });
    }
    if (validacionUsuario.terminaConEspacio || validacionPassword.terminaConEspacio) {
        return res.status(400).json({ message: 'No pueden terminar con un espacio. 400' });
    }
    if (validacionUsuario.espaciosContinuos || validacionPassword.espaciosContinuos) {
        return res.status(400).json({ message: 'No puede haber un espacio seguido de otro. 400' });
    }

    const query = 'SELECT * FROM Users WHERE username = ?';

    try {
        db.get(query, [usernameR], async (err, row) => {
            if (err) {
                return res.status(500).json({ message: 'Error al buscar el usuario. 500' });
            }
            if (row) {
                return res.status(400).json({ message: 'El nombre de usuario ya está en uso. 400' });
            } else {
                try {
                    const hashedPasswordR = await bcrypt.hash(passwordR, 10);
                    db.run('INSERT INTO Users (username, password) VALUES (?, ?)', [usernameR, hashedPasswordR], function(err) {
                        if (err) {
                            console.error('Error al crear usuario:', err.message);
                            if (err.code !== 'SQLITE_CONSTRAINT') {
                                return res.status(500).json({ message: 'Error al crear usuario. 500', error: err.message });
                            }
                        }
                        const userId = this.lastID;
                        console.log('Usuario creado ID:', userId);
                        return res.status(201).json({ message: 'Usuario creado', userId: userId });
                    });
                } catch (hashError) {
                    console.error('Error al hash de la contraseña:', hashError.message);
                    return res.status(500).json({ message: 'Error al procesar la contraseña. 500' });
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});



app.post('/api/logout', async (req, res) => {
    const { id_user, usernameNav, tokenNav } = req.body;

    if (id_user) {
        try {
            db.run('UPDATE Tokens SET cookieToken = 0, created_at = 0 WHERE id_user = ?', [id_user], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al cerrar sesión.' });
                }
                return res.status(200).json({ message: 'Sesión cerrada correctamente.' });
            });
        } catch (err) {
            return res.status(500).json({ message: 'Error al borrar el token de la Base de Datos.' });
        }
    } else if (usernameNav) {
        try {
            db.all('SELECT username FROM Tokens', async (err, rows) => {
                if (err) {
                    return res.status(500).json({ message: "Error interno del servidor al obtener los usuarios." });
                }

                // Iteramos sobre los resultados y comparamos el hash
                let userFound = false;
                for (const row of rows) {
                    const matchU = await bcrypt.compare(row.username, usernameNav);
                    if (matchU) {
                        userFound = true;
                        // Actualizamos la base de datos para ese usuario
                        db.run('UPDATE Tokens SET cookieToken = 0, created_at = 0 WHERE username = ?', [row.username], (err) => {
                            if (err) {
                                return res.status(500).json({ message: "Error al actualizar cookieToken y created_at." });
                            }
                            return res.status(200).json({ message: "Sesión cerrada correctamente." });
                        });
                        break; // Salimos del bucle si encontramos el usuario
                    }
                }

                if (!userFound) {
                    return res.status(404).json({ message: "Usuario no encontrado." });
                }
            });
        } catch (err) {
            return res.status(500).json({ message: "Error al intentar obtener los datos.", error: err.message });
        }
    } else if (tokenNav){
        try{
            db.all('SELECT cookieToken FROM Tokens', async (err, rows) => {
                if (err){
                    return res.status(500).json({ message: "Error interno del servidor al querer obtener las cookies de la base de datos." });
                }
                let cookieFound = false;
                for (const row of rows) {
                    const matchC = await bcrypt.compare(row.cookieToken, tokenNav);
                    if (matchC){
                        cookieFound = true;
                        db.run('UPDATE Tokens SET cookieToken = 0, created_at = 0 WHERE cookieToken = ?', [row.cookieToken], (err) => {
                            if (err) {
                                return res.status(500).json({ message: "Error al actualizar cookieToken y created_at." });
                            }
                            return res.status(200).json({ message: "Sesión cerrada correctamente." });
                        });
                        break; // Salimos del bucle si encontramos el usuario
                    }
                }
            })
        } catch (err) {
            return res.status(err);
        }
    }
});



app.delete('/api/delete', (req, res) => {
    const { nombre } = req.body;
    if (nombre) {
        const deleteQuery = 'DELETE FROM Users WHERE username = ?';
        db.run(deleteQuery, [nombre], function (err) {
            if (err) {
                return res.status(500).json({ message: 'Error al eliminar el usuario.' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado.' });
            }
            res.status(200).json({ message: `Usuario ${nombre} eliminado correctamente.` });
        });
    } else {
        return res.status(400).json({ message: 'No se ha indicado un nombre para borrar.' });
    }
});


app.post('/api/checkeo', async (req, res) => {
    const { tokenNav, usernameNav, idUserNav } = req.body;
    const tiempoActual = new Date().toISOString();

    try {
        db.get('SELECT cookieToken, username, created_at FROM Tokens WHERE id_user = ?', [idUserNav], async function (err, row) {
            if (err) {
                console.error('Error de base de datos:', err);
                return res.status(500).json({ message: 'Error interno del servidor.' });
            }
            if (!row) {
                return res.status(404).json({ message: 'No se han encontrado los datos.' });
            }

            const matchT = await bcrypt.compare(row.cookieToken, tokenNav); // Usar tokenNav y row.cookieToken
            console.log('Comparación de token:', matchT);
            const usernameMatch = await bcrypt.compare(row.username, usernameNav); // Usar usernameNav y row.username
            console.log('Comparación de usuario:', usernameMatch);

            const createdAt = row.created_at;
            const tiempo = (createdAt, tiempoActual) => {
                const createdDate = new Date(createdAt);
                const currentDate = new Date(tiempoActual);
                const UnDiaMilisegundos = 24 * 60 * 60 * 1000;
                return (currentDate - createdDate) >= UnDiaMilisegundos;
            };

            if (tiempo(createdAt, tiempoActual)) {
                db.run('UPDATE Tokens SET cookieToken = 0, created_at = 0, WHERE id_user = ?', [idUserNav], function (err) {
                    if (err) {
                        return res.status(500).json({ message: "Error interno del servidor al actualizar el estado del cookieToken." });
                    }
                    else {
                        return res.status(err).json({ message: err.message });
                    }
                });
            } else {
                if (matchT && usernameMatch) {
                    return res.status(200).json({ message: 'Los tokens coinciden.' });
                } else {
                    return res.status(401).json({ message: 'Los tokens no coinciden.' });
                }
            }
        });
    } catch (err) {
        console.error('Error interno del servidor:', err);
        return res.status(500).json({ message: 'Error interno del servidor.', error: err.message });
    }
});



// app.get(`/api/recetas/:${id_}`)



app.post('/api/cookie/delete', async (req, res) => {
    const { id_user, usernameNav } = req.body;

    if (id_user !== undefined) {
        try {
            db.run('UPDATE Tokens SET cookieToken = 0, created_at = 0 WHERE id_user = ?', [id_user], (err) => {
                if (err) {
                    console.error('Error al cerrar sesión:', err);
                    return res.status(500).json({ message: 'Error al cerrar sesión.' });
                }
                console.log('Sesión cerrada correctamente para id_user:', id_user);
                return res.status(200).json({ message: 'Sesión cerrada correctamente.' });
            });
        } catch (err) {
            console.error('Error al borrar el token de la Base de Datos:', err);
            return res.status(500).json({ message: 'Error al borrar el token de la Base de Datos.' });
        }
    } else if (usernameNav !== undefined) {
        try {
            db.all('SELECT username FROM Tokens', async (err, rows) => {
                if (err) {
                    console.error('Error al obtener todos los usuarios:', err);
                    return res.status(500).json({ message: "Error interno del servidor al obtener todos los usuarios." });
                }

                let userFound = false;
                for (const row of rows) {
                    let matchU = await bcrypt.compare(row.username, usernameNav);
                    if (matchU) {
                        userFound = true;
                        let usernameNH = row.username;
                        console.log('Usuario encontrado:', usernameNH);
                        try {
                            db.run('UPDATE Tokens SET cookieToken = 0, created_at = 0 WHERE username = ?', [usernameNH], (err) => {
                                if (err) {
                                    console.error('Error al intentar actualizar cookieToken y created_at:', err);
                                    return res.status(500).json({ message: "Error interno del servidor al intentar actualizar cookieToken y created_at." });
                                }
                                console.log('Datos actualizados correctamente para usuario:', usernameNH);
                                return res.status(200).json({ message: "Se han actualizado los datos correctamente." });
                            });
                        } catch (err) {
                            console.error('Error al intentar actualizar los datos:', err);
                            return res.status(500).json({ message: "Error al intentar actualizar los datos.", error: err.message });
                        }
                        break;
                    }
                }
                if (!userFound) {
                    console.log('Usuario no encontrado');
                    return res.status(404).json({ message: "Usuario no encontrado." });
                }
            });
        } catch (err) {
            console.error('Error al intentar obtener los datos:', err);
            return res.status(500).json({ message: "Error al intentar obtener los datos.", error: err.message });
        }
    } else {
        return res.status(400).json({ message: "No se proporcionó ni id_user ni usernameNav." });
    }
});




// ------------------------ API REST (Recetas) -------------------------
app.get('/api/recetas', (req, res) => {
    const getQuery = 'SELECT * FROM Recipe';
    db.all(getQuery, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error al determinar los datos de las recetas.' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se han encontrado recetas.' });
        }
        // No necesitas todas estas verificaciones si estás devolviendo todos los datos.
        return res.status(200).json({
            message: 'Se han encontrado todos los datos de la receta.',
            recetas: rows // Devolver todas las recetas
        });
    });
});



app.post("/api/receta/nueva", (req, res) => {
    const { username, recipe_name, difficulty, description, ingredients, steps, categories, tiempo } = req.body;

    if (!username || !recipe_name || !difficulty || !description || !ingredients || !steps || !categories || !tiempo) {
        console.log("Faltan parámetros:", { username, recipe_name, difficulty, description, ingredients, steps, categories, tiempo });
        return res.status(400).json({ message: "No se ha indicado uno o varios parámetros." });
    } else {
        try {
            const categoryArray = categories.split(',').map(cat => cat.trim()); // Separar y limpiar categorías

            // Verificar si las categorías existen
            const placeholders = categoryArray.map(() => '?').join(',');
            const checkCategoriesQuery = `SELECT category FROM Categories WHERE category IN (${placeholders})`;
            console.log("Verificando categorías con consulta:", checkCategoriesQuery);

            db.all(checkCategoriesQuery, categoryArray, function(err, rows) {
                if (err) {
                    console.error("Error al verificar las categorías:", err.message);
                    return res.status(500).json({ message: 'Error al verificar las categorías.', error: err.message });
                }

                // Encontrar las categorías que faltan
                const existingCategories = rows.map(row => row.category);
                const missingCategories = categoryArray.filter(cat => !existingCategories.includes(cat));
                console.log("Categorías que faltan:", missingCategories);

                if (missingCategories.length > 0) {
                    return res.status(400).json({ message: `Una o más categorías no existen: ${missingCategories.join(', ')}` });
                }

                // Insertar la nueva receta
                const insertQuery = `INSERT INTO Recipe (username, recipe_name, difficulty, description, ingredients, steps, categories, tiempo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                console.log("Insertando receta con consulta:", insertQuery);

                db.run(insertQuery, [username, recipe_name, difficulty, description, ingredients, steps, categories, tiempo], function(err) {
                    if (err) {
                        console.error("Error al insertar la receta: ", err.message);
                        return res.status(500).json({ message: 'Error al crear la receta.', error: err.message });
                    } else {
                        console.log("Receta creada con éxito, ID de receta:", this.lastID);
                        return res.status(201).json({ message: "Se ha creado la receta.", recipeId: this.lastID });
                    }
                });
            });
        } catch (err) {
            console.error("Error en el servidor:", err.message);
            return res.status(500).json({ message: 'Error interno del servidor.', error: err.message });
        }
    }
});



app.get('/api/receta/:id', (req, res) => {
    const { id } = req.params; // req.params es un objeto, no una función
    const getQuery = 'SELECT * FROM Recipe WHERE id_recipe = ?';
    db.all(getQuery, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error al determinar los datos de las recetas.' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se han encontrado recetas.' });
        }
        return res.status(200).json({
            message: 'Se han encontrado todos los datos de la receta.',
            receta: rows
        });
    });
});


process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});