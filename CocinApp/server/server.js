const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();
const PORT = 5000;
// const host = 'http://pruebita.webhop.me';
const host = 'http://localhost';
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

app.post('/token-generator', async (req, res) => {
    const { username } = req.body;

    try {
        const min = 100;
        const max = 1000;
        let token = ''; // Inicializar token como una cadena vacía

        const generadorToken = () => {
            for (let index = 0; index < 100; index++) {
                const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
                token += randomNumber.toString();
            }
        };

        generadorToken(); // Llamar a la función generadorToken

        try {
            const tokenHashed = await bcrypt.hash(token, 10); // Usar await para manejar la operación asíncrona
            const hashedUsername = await bcrypt.hash(username, 10);

            if (token.length !== 0 && hashedUsername) {
                try{
                    db.get('SELECT id_user FROM Users WHERE username = ?', [username], function (err, row){
                        if (err){
                            return res.status(500).json({ message: "Error interno del servidor." });
                        }
                        if (!row){
                            return res.status(404).json({ message: "No se ha encontrado la id." });
                        }
                        else {
                            return res.status(201).json({
                                message: "Se ha creado el token de la cookie con éxito.",
                                token: tokenHashed,
                                nombre: hashedUsername,
                                id_user: row.id_user,
                            });
                        }
                    })
                }catch(err){

                }
            } else {
                console.log(tokenHashed);
                return res.status(500).json({ message: "Ha ocurrido un error con el token." });
            }
        } catch (err){

        }
    } catch (err) {
        return res.status(500).json({ message: "Ha ocurrido un problema.", err: err.message });
    }
});

app.post('/api/agregar-token', (req, res) => {
    const { cookieToken, username, id_user } = req.body;
    const query = 'INSERT INTO Tokens (username, cookieToken, id_user) VALUES (?, ?, ?)';

    try {
        db.run(query, [username, cookieToken, id_user], function(err){
            if (err){
                return res.status(500).json({ message: "Error interno del servidor." });
            } else {
                return res.status(201).json({ message: "Se ha asignado el token correctamente al usuario."});
            }
        })
    } catch (err){
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
})



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




app.post('/api/logout', (req, res) => {
    const { nombre } = req.body;
    if (!nombre){
        return res.status(400).json({ message: 'Error, no hay nombre de usuario.'});
    } else {
        db.get('Select * FROM Users WHERE username = ?', [nombre], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al cerrar sesión.' });
            }
            res.status(200).json({ message: 'se encontro al usuario, cierre de sesión en proceso.' });
        });
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

app.post('/api/checkeo', (req, res) => {
    const { cookieToken, username } = req.body;

            const checkToken = 'SELECT cookieToken FROM Tokens WHERE username = ?';
            try {
                db.get(checkToken, [username], function (err, row) {
                    if (err) {
                        return res.status(500).json({ message: 'Error interno del server.' });
                    }
                    if (!row) {
                        return res.status(404).json({ message: 'No se ha encontrado una cookie' })
                    } if (row) {
                        const matchT = (cookieToken, row.cookieToken);

                        if (matchT){
                            return res.status(200).json({ message: 'Los tokens coinciden.' });
                        }
                    }
                })
            } catch (err) {
                return res.status(500).json({ message: 'Error interno del servidor.', error: err.message });
            }
        }
    );




// app.get(`/api/recetas/:${id_}`)

app.post('/api/cookie/delete', (req, res) => {
    const { nombre } = req.body;
    if (!nombre){
        return res.status(400).json({ message: 'Error, no hay nombre de usuario.'});
    } else {
        try {
            db.run('UPDATE Tokens SET cookieToken = 0 WHERE username = ?', [nombre], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al cerrar sesión.' });
                }
                else {
                    return res.status(200).json({ message: 'Sesión cerrada correctamente.' });
                }
            });
        } catch (err) {
            return res.status(500).json({ message: 'Error al borrar el token de la Base de Datos.' });
        }
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