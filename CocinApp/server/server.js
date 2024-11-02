const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
require('dotenv').config();
// PORTS
const PORT = 5000;
const PORT_FRONTEND = 5173
// HOST

//***************************************************************** */
// ¡¡¡HOST  HOST_FRONTEND(localhost) HOST_FRONTEND2(pruebita) !!!!
//***************************************************************** */
const host = process.env.HOST_FRONTEND2;


function validarEntrada(texto) {
    const espaciosContinuos = /\s{2,}/.test(texto);
    return {
        espaciosContinuos,
        empiezaConEspacio: texto.startsWith(' '),
        terminaConEspacio: texto.endsWith(' '),
    };
}


const allowedOrigins = [`${host}:${PORT_FRONTEND}`];
const corsOptions = {
  origin: (origin, callback) => {
    // console.log('Solicitud proveniente del origen:', origin || 'Sin origen (solicitud local o del mismo servidor)');
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);  // Permite solicitudes de orígenes permitidos
    } else {
      callback();  // Bloquea orígenes no permitidos
    }
  },
  optionsSuccessStatus: 200
};

// Middleware para aplicar CORS y registrar el origen
app.use(cors(corsOptions));
app.use(express.json());

const db = new sqlite3.Database('./BasedeDatos.db');
// const db = new sqlite3.Database('./db.db');

cron.schedule('*/1 * * * *', () => { //Tarea ejecutada cada 1 minuto
    db.run('UPDATE Tokens SET cookieToken = 0, created_at = 0 WHERE julianday(\'now\') - julianday(created_at) >= 1', (err) => {
        if (err) {
            return console.error('Error al actualizar cookieToken:', err.message);
        }
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

app.post('/api/usuarios', (req, res) => {
    const { id } = req.body;
    try{
        db.get('SELECT username FROM Users WHERE id_user = ?', [id], (err, row) => {
            if(err){
                return res.status(500).json({ message: "Error interno del servidor" });
            }
            if(!row){
                return res.status(404).json({ message: "No se han encontrado los usuarios" })
            }
        })
    }catch(err){
        return res.status()
    }
});

app.post('/api/verifpassword', (req, res) => {
    const { contraUser } = req.body;
    const id_user = req.cookies.id_user;
    // Validar la entrada
    if (!id_user || !contraUser) {
        return res.status(400).json({ message: "Falta proporcionar datos" });
    }


    db.get('SELECT password FROM Users WHERE id_user = ?', [id_user], async (err, row) => {
        if (err) {
            return res.status(500).json({ message: "Error interno del server al querer obtener el dato del usuario." });
        }
        if (!row) {
            res.clearCookie('id_user');
            res.clearCookie('username');
            res.clearCookie('token');
            return res.status(404).json({ message: "No se ha encontrado el dato del usuario." });
        }

        const match = await bcrypt.compare(contraUser, row.password);
        if (match) {
            const deleteQueryUsersTable = 'DELETE FROM Users WHERE id_user = ?';
            const deleteQueryTokensTable = 'DELETE FROM Tokens WHERE id_user = ?';

            db.run(deleteQueryTokensTable, [id_user], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error interno del server al eliminar el token.' });
                }

                db.run(deleteQueryUsersTable, [id_user], (err) => {
                    if (err) {
                        return res.status(500).json({ message: "Error interno del server al eliminar al usuario." });
                    }
                    res.clearCookie("id_user");
                    res.clearCookie("username");
                    res.clearCookie("token");
                    return res.status(200).json({ message: "Usuario eliminado con éxito de la tabla Users y Tokens." });
                });
            });
        } else {
            return res.status(401).json({ message: "Contraseña incorrecta." });
        }
    });
});


app.get('/api/info-usuario', async (req, res) => {
    const id_user = req.cookies.id_user;
    if (!id_user){
        return res.status(401).json({ message: "no hay id_user indicado,"});
    }else {
        try{
            db.get('SELECT username FROM Users WHERE id_user = ?', [id_user], (err, row) => {
                if(err){
                    return res.status(500).json({ message: "Error interno del server al querer obtener el nombre de usuario en la base de datos." });
                }
                const username = row.username;
                return res.status(200).json({ 
                    message: "Se obtuvo el usuario con exito de la base de datos.",
                    username,
                 })
            })
        }catch (err){
            return res.status(err);
        }
    }
})

app.post('/api/token-register', async (req, res) => {
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
                res.cookie("token", tokenH, { httpOnly: true, expires: new Date(Date.now() + 86400000) });
                res.cookie("username", usernameH, { httpOnly: true, expires: new Date(Date.now() + 86400000) });
                res.cookie("id_user", id_user, { httpOnly: true, expires: new Date(Date.now() + 86400000) });
                return res.status(201).json({ message: "Se ha creado el token de la cookie con éxito." });
            });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error interno del servidor.", error: err.message });
    }
});



app.post('/api/token-login', async (req, res) => {
    const { usernameNH } = req.body;

    try {
        // Verificamos el valor de cookieToken en la base de datos
        db.get('SELECT cookieToken FROM Tokens WHERE username = ?', [usernameNH], async (err, row) => {
            if (err) {
                return res.status(500).json({ message: `Error interno del servidor al verificar el valor de cookieToken para el usuario: ${usernameNH}.` });
            }
            if (!row) {
                return res.status(400).json({ message: `No se ha encontrado el cookieToken del usuario: ${usernameNH}` });
            }

            const tokenDB = row.cookieToken;

            // Verificamos si el cookieToken es '0'
            if (tokenDB === '0') {
                // Generar un nuevo token
                const generateToken = () => {
                    let token = '';
                    for (let i = 0; i < 300; i++) {
                        const randomNumber = Math.floor(Math.random() * (3000 - 100 + 1)) + 100;
                        token += randomNumber.toString();
                    }
                    return token;
                };

                const tokenNH = generateToken();
                const tokenH = await bcrypt.hash(tokenNH, 10);
                const usernameH = await bcrypt.hash(usernameNH, 10);
                const createdAt = new Date().toISOString();

                // Buscamos el id_user para almacenar junto al token
                db.get('SELECT id_user FROM Users WHERE username = ?', [usernameNH], (err, userRow) => {
                    if (err) {
                        return res.status(500).json({ message: `Error interno del servidor al buscar el usuario ${usernameNH}.` });
                    }
                    if (!userRow) {
                        return res.status(404).json({ message: `No hay datos sobre este usuario: ${usernameNH}.` });
                    }

                    const id_user = userRow.id_user;

                    // Actualizamos el token y la fecha de creación
                    db.run('UPDATE Tokens SET cookieToken = ?, created_at = ? WHERE username = ?', [tokenNH, createdAt, usernameNH], function (err) {
                        if (err) {
                            return res.status(500).json({ message: "Error interno del servidor al actualizar el token." });
                        }
                        // Establecemos las cookies
                        res.cookie("token", tokenH, { httpOnly: true, expires: new Date(Date.now() + 86400000) });
                        res.cookie("username", usernameH, { httpOnly: true, expires: new Date(Date.now() + 86400000) });
                        res.cookie("id_user", id_user, { httpOnly: true, expires: new Date(Date.now() + 86400000) });
                        return res.status(201).json({ message: "Se ha creado el token de la cookie con éxito." });
                    });
                });
            } else {
                // Si cookieToken no es '0', no se permite el inicio de sesión
                return res.status(403).json({ message: "No se puede iniciar sesión, el token ya está en uso." });
            }
        });
    } catch (err) {
        return res.status(500).json({ message: `Ha ocurrido un error al intentar loguear al usuario ${usernameNH}, error: ${err}` });
    }
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
                    else {
                        return res.status(400).json({ message: "Los datos no coinciden con la base de datos." });
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
    const id_user = req.cookies.id_user;

    if (id_user) {
        try {
            db.run('UPDATE Tokens SET cookieToken = 0, created_at = 0 WHERE id_user = ?', [id_user], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al cerrar sesión.' });
                }
                res.clearCookie('id_user');
                res.clearCookie('username');
                res.clearCookie('token');
                return res.status(200).json({ message: 'Sesión cerrada correctamente.' });
            });
        } catch (err) {
            return res.status(500).json({ message: 'Error al borrar el token de la Base de Datos.' });
        }
    } else {
        res.clearCookie('id_user');
        res.clearCookie('username');
        res.clearCookie('token');
        return res.status(400).json({ message: "No se recibio un idUser." });
    }
});



app.delete('/api/delete', (req, res) => {
    const { user } = req.body;
    if (user) {
        const deleteQueryUsersTable = 'DELETE FROM Users WHERE id_user = ?';
        const deleteQueryTokensTable = 'DELETE FROM Tokens WHERE id_user = ?';

        try{
            db.run(deleteQueryTokensTable, [user], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error interno del server al eliminar el usuario.' });
                }
                
            db.run(deleteQueryUsersTable, [user], (err) => {
                if (err){
                    return res.status(500).json({ message: "Error interno del server al eliminar al usuario." });
                    }
                return res.status(200).json({ message: "Usuario eliminado con exito de la tabla Users y Tokens." });
            });
            });
        } catch (err){
            
        }
    } else {
        return res.status(400).json({ message: 'No se ha indicado un usuario para borrar.' });
    }
});


app.post('/api/checkeo', async (req, res) => {

    // Obtener las cookies
    const tokenNav = req.cookies.token;
    const usernameNav = req.cookies.username;
    const idUserNav = req.cookies.id_user;

    // Verificar que las cookies no están vacías
    if (!tokenNav || !usernameNav || !idUserNav) {
        console.log('Faltan cookies de autenticación.'); // Log de error
        res.clearCookie('id_user');
        res.clearCookie('username');
        res.clearCookie('token');
        return res.status(401).json({ message: 'No hay cookies de autenticación.' });
    }

    const tiempoActual = new Date().toISOString();
    console.log('Tiempo actual:', tiempoActual); // Log del tiempo actual

    try {
        // Consultar la base de datos para obtener el token y el nombre de usuario
        db.get('SELECT cookieToken, username, created_at FROM Tokens WHERE id_user = ?', [idUserNav], async function (err, row) {
            if (err) {
                console.error('Error de base de datos:', err);
                return res.status(500).json({ message: 'Error interno del servidor.' });
            }
            if (!row) {
                res.clearCookie('id_user');
                res.clearCookie('username');
                res.clearCookie('token');
                return res.status(404).json({ message: 'No se han encontrado los datos.' });
            }

            // Comparar el token y el nombre de usuario
            const matchT = await bcrypt.compare(row.cookieToken, tokenNav);
            const usernameMatch = await bcrypt.compare(row.username, usernameNav);

            const createdAt = row.created_at;

            // Función para verificar si el token ha expirado (más de 24 horas)
            const tiempo = (createdAt, tiempoActual) => {
                const createdDate = new Date(createdAt);
                const currentDate = new Date(tiempoActual);
                const UnDiaMilisegundos = 24 * 60 * 60 * 1000;
                return (currentDate - createdDate) >= UnDiaMilisegundos;
            };

            // Verificar si el token ha expirado
            if (tiempo(createdAt, tiempoActual)) {
                console.log('Token expirado, actualizando estado.'); // Log de token expirado
                db.run('UPDATE Tokens SET cookieToken = 0, created_at = 0 WHERE id_user = ?', [idUserNav], function (err) {
                    if (err) {
                        console.error('Error al actualizar el estado del cookieToken:', err);
                        return res.status(500).json({ message: "Error interno del servidor al actualizar el estado del cookieToken." });
                    }
                    res.clearCookie('id_user');
                    res.clearCookie('username');
                    res.clearCookie('token');
                    return res.status(200).json({ message: 'Token expirado y actualizado.' });
                });
            } else {
                if (matchT && usernameMatch) {
                    return res.status(200).json({ message: 'Los tokens coinciden.' });
                } else {
                    res.clearCookie('id_user');
                    res.clearCookie('username');
                    res.clearCookie('token');
                    return res.status(401).json({ message: 'Los tokens no coinciden.' });
                }
            }
        });
    } catch (err) {
        res.clearCookie('id_user');
        res.clearCookie('username');
        res.clearCookie('token');
        return res.status(500).json({ message: 'Error interno del servidor.', error: err.message });
    }
});


app.post('/api/cookie/delete', async (req, res) => {
    const id_user = req.cookies.id_user;

    if (id_user) {
        try {
            db.run('UPDATE Tokens SET cookieToken = 0, created_at = 0 WHERE id_user = ?', [id_user], (err) => {
                if (err) {
                    console.error('Error al cerrar sesión:', err);
                    return res.status(500).json({ message: 'Error al cerrar sesión.' });
                }
                res.clearCookie("id_user");
                res.clearCookie("username");
                res.clearCookie("token");
                return res.status(200).json({ message: 'Sesión cerrada correctamente.' });
            });
        } catch (err) {
            console.error('Error al borrar el token de la Base de Datos:', err);
            return res.status(500).json({ message: 'Error al borrar el token de la Base de Datos.' });
        }
    } else {
        res.clearCookie('id_user');
        res.clearCookie('username');
        res.clearCookie('token');
        return res.status(400).json({ message: "No se proporcionó un id_user." });
    }
});




// ------------------------ API REST (Recetas) -------------------------
app.post('/api/recetas', (req, res) => {
    
    const { anchoBoolean } = req.body;

    if (anchoBoolean === 1){
        const limit = 9; // Número de recetas por página
            // Consulta para obtener las recetas con paginación
        const getQuery = `SELECT * FROM Recipe ORDER BY id_recipe DESC LIMIT ?`;

    // Consulta para contar el número total de recetas (sin límite ni offset)
    // const countQuery = 'SELECT COUNT(*) as total FROM Recipe';

    db.all(getQuery, [limit], (err, rows) => {
        if (err){
            return res.status(500).json({
                message: "Ha ocurrido un error interno del servidor al intentar conseguir las recetas.",
                error: err,
            })
        } else if (!rows){
            return res.status(404).json({
                message: "No se han encontrado las recetas.",
                error: err,
            })
        } else {
            return res.status(200).json({
                message: "Se han encontrado las recetas en la base de datos.",
                recetas: rows,
            })
        }
    })
    } if (anchoBoolean === 0) {
        const limit = 8; // Número de recetas por página
            // Consulta para obtener las recetas con paginación
        const getQuery = `SELECT * FROM Recipe ORDER BY id_recipe DESC LIMIT ?`;

        db.all(getQuery, [limit], (err, rows) => {
            if(err){
                return res.status(500).json({
                    message: "Ha ocurrido un error interno del servidor al intentar conseguir las recetas.",
                    error: err,
                })
            } else if (!rows){
                return res.status(404).json({
                    message: "No se han encontrado las recetas en la base de datos.",
                    error: err,
                })
            } else {
                return res.status(200).json({
                    message: "Se han encontrado las recetas en la base de datos.",
                    recetas: rows,
                })
            }
        })
    }
});

app.post('/api/recetas/filtradas', (req, res) => {
    const { pageNumber, anchoBoolean, nombreReceta, arrayCategorias } = req.body;
    const page = parseInt(pageNumber) || 1;
    const limit = anchoBoolean === 1 ? 9 : 8; // Definir límite según anchoBooleanF
    const offset = (page - 1) * limit;

    // Construcción de consultas y parámetros
    let countQuery = 'SELECT COUNT(*) as total FROM Recipe';
    let query = 'SELECT * FROM Recipe';
    let whereClauses = [];
    let params = [];

    if (arrayCategorias && arrayCategorias.length > 0) {
        const placeholders = arrayCategorias.map(() => 'categories LIKE ?').join(' AND ');
        whereClauses.push(`(${placeholders})`);
        params.push(...arrayCategorias.map(cat => `%${cat}%`));
    }

    if (nombreReceta) {
        whereClauses.push('LOWER(recipe_name) LIKE LOWER(?)');
        params.push(`%${nombreReceta}%`);
    }

    if (whereClauses.length > 0) {
        countQuery += ' WHERE ' + whereClauses.join(' AND ');
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY id_recipe DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Ejecutar consulta de conteo
    db.get(countQuery, params.slice(0, params.length - 2), (err, countResult) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener el total de recetas filtradas.', error: err.message });
        }
        const totalRecetas = countResult.total;
        const totalPages = Math.ceil(totalRecetas / limit);

        // Ejecutar consulta de recetas filtradas
        db.all(query, params, (err, rows) => {
            if (err) {
                return res.status(500).json({ message: 'Error al obtener las recetas filtradas.', error: err.message });
            }
            if (rows.length === 0) {
                return res.status(404).json({ message: 'No se encontraron recetas para los filtros aplicados.' });
            }
            return res.status(200).json({
                message: 'Recetas encontradas exitosamente',
                recetas: rows,
                total: totalRecetas,
                totalPages: totalPages,
                currentPage: page
            });
        });
    });
});



app.post('/api/recetas/personales', (req, res) => {
    const { usernameNH } = req.body;

    const getQuery = 'SELECT * FROM Recipe WHERE username = ? ORDER BY id_recipe DESC';
    try{
        db.all(getQuery, [usernameNH], (err, rows) => {
            if (err) {
                return res.status(500).json({ message: 'Error al determinar los datos de las recetas.' });
            }
            if (rows.length === 0) {
                return res.status(404).json({ message: 'No se han encontrado recetas.' });
            }
            return res.status(200).json({
                message: 'Se han encontrado todos los datos de la receta.',
                recetas: rows,
            });
        })
    }catch (err){
        return res.status(err);
    }
})

app.post("/api/receta-nueva", async (req, res) => {
    const { username, receta } = req.body;

    // Validar si todos los parámetros requeridos están presentes
    if (!username || !receta.recipeName || !receta.difficulty || !receta.description || !receta.ingredients || !receta.steps || !receta.categories || !receta.tiempo) {
        return res.status(400).json({ 
            message: `No se ha indicado uno o varios parámetros.`, 
            detalles: { 
                username, 
                recipeName: receta.recipeName, 
                difficulty: receta.difficulty, 
                categories: receta.categories, 
                description: receta.description, 
                ingredients: receta.ingredients, 
                steps: receta.steps, 
                tiempo: receta.tiempo 
            } 
        });
    }

    try {
        const categoryArray = receta.categories;
        const placeholders = categoryArray.map(() => '?').join(',');

        // Verificar que las categorías existen en la tabla `Categories`
        const checkCategoriesQuery = `SELECT category FROM Categories WHERE category IN (${placeholders})`;
        console.log("Verificando categorías con consulta:", checkCategoriesQuery);

        const rows = await new Promise((resolve, reject) => {
            db.all(checkCategoriesQuery, categoryArray, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        const existingCategories = rows.map(row => row.category);
        const missingCategories = categoryArray.filter(cat => !existingCategories.includes(cat));

        if (missingCategories.length > 0) {
            return res.status(400).json({ 
                message: `Una o más categorías no existen: ${missingCategories.join(', ')}` 
            });
        }

        // Insertar la receta con las categorías almacenadas como cadena separada por comas
        const insertQuery = `INSERT INTO Recipe (username, recipe_name, difficulty, description, ingredients, steps, categories, tiempo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        console.log("Insertando receta con consulta:", insertQuery);

        const lastID = await new Promise((resolve, reject) => {
            db.run(insertQuery, [
                username, 
                receta.recipeName, 
                receta.difficulty, 
                receta.description, 
                receta.ingredients, 
                receta.steps, 
                categoryArray.join(', '), // Guardar las categorías como una cadena separada por comas
                receta.tiempo
            ], function(err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });

        return res.status(201).json({ 
            message: "Se ha creado la receta.", 
            recetaId: lastID 
        });

    } catch (err) {
        console.error("Error en el servidor:", err.message);
        return res.status(500).json({ 
            message: 'Error interno del servidor.', 
            error: err.message 
        });
    }
});



app.post('/api/receta-id', (req, res) => {
    const { id_recipe } = req.body; // req.params es un objeto, no una función
    const getQuery = 'SELECT * FROM Recipe WHERE id_recipe = ?';
    db.all(getQuery, [id_recipe], (err, rows) => {
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
    console.log(`Servidor escuchando en ${host}:${PORT}`);
});