const express = require('express');

const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require("fs");
const { type } = require('os');
const app = express();
app.use(cookieParser());
require('dotenv').config();
// PORTS
const PORT = 5000;
const PORT_FRONTEND = 4173
// HOST

//***************************************************************** */
// ¡¡¡HOST  HOST_FRONTEND(localhost) HOST_FRONTEND2(pruebita) !!!!
//***************************************************************** */
const host = process.env.HOST_FRONTEND;



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
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);  // Permite solicitudes de orígenes permitidos
    } else {
      callback();  // Bloquea orígenes no permitidos
    }
  },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'],  // Cabeceras permitidas
    optionsSuccessStatus: 200
};



// Middleware para aplicar CORS y registrar el origen
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());



app.use((req, res, next) => {
    const redirectURL = '/';  // Asegúrate de que esta ruta esté disponible
    const rutasProtegidas = ["/Panel-de-Recetas/"];  // En este caso solo requerimos proteger una ruta, pero guardamos este codigo para uso posterior en otros proyectos.

    console.log(`Peticion a la ruta ${req.url}`)
    // Compara la URL solicitada con las rutas protegidas
    for (let i = 0; i < rutasProtegidas.length; i++) {
        if (req.originalUrl.includes(rutasProtegidas[i])) {
            return res.redirect(redirectURL);
        }
    }

    next();  // Si no es una ruta protegida, continúa con el siguiente middleware
});



app.use((req, res, next) => {  
    // Establecer el encabezado Content-Security-Policy correctamente como una cadena
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self'; " +
      "style-src 'self'; " +
      "img-src 'self'; " +
      "font-src 'self'; " +
      "connect-src 'self'; " +
      "object-src 'none'; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self';"
    );
  
    // Otros encabezados de seguridad
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.removeHeader('x-powered-by');
  
    // CORS (Access-Control-Allow-* headers)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');  // Métodos permitidos
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');  // Cabeceras permitidas
    res.setHeader('Access-Control-Allow-Origin', `${host}:${PORT_FRONTEND}`);  // Origen permitido
    
    // Llamar al siguiente middleware
    next();
  });
  


const db = new sqlite3.Database('./BasedeDatos.db');
// const db = new sqlite3.Database('./db.db');


// Ejecucion/verificacion cada 1 minuto relacionada a la expiracion de tokens.

cron.schedule('*/1 * * * *', () => { //Tarea ejecutada cada 1 minuto
    db.run('UPDATE Tokens SET cookieToken = 0, created_at = 0 WHERE julianday(\'now\') - julianday(created_at) >= 1', (err) => {
        if (err) {
            return console.error('Error al actualizar cookieToken:', err.message);
        }
    });
});

// -----------------------------------------------------------------------------

// Ejecucion/verificacion cada 1 minuto relacionada al backup de las imagenes en proyecto build.

cron.schedule('*/1 * * * *', () => { // Tarea ejecutada cada 1 minuto
    const carpetaOriginal = '../dist/uploads/';
    const carpetaRespaldo = '../public/uploads/';
    
    // Verificar si las carpetas de origen y destino existen.
    if (!fs.existsSync(carpetaOriginal)) {
        console.log(`No existe: ${carpetaOriginal}`);
        return;
    }
    if (!fs.existsSync(carpetaRespaldo)) {
        console.log(`No existe: ${carpetaRespaldo}`);
        return;
    }

    // Leer las imágenes en la carpeta de respaldo
    fs.readdir(carpetaRespaldo, (err, imagenesRespaldo) => {
        if (err) {
            console.error('Error al leer la carpeta de respaldo:', err);
            return;
        }

        // Eliminar las imágenes en la carpeta de respaldo que no están en la carpeta original
        imagenesRespaldo.forEach(imagen => {
            const imagenOriginal = path.join(carpetaOriginal, imagen);
            const imagenRespaldo = path.join(carpetaRespaldo, imagen);
            
            if (!fs.existsSync(imagenOriginal)) {
                // La imagen no está en la carpeta original, eliminar de respaldo
                fs.unlinkSync(imagenRespaldo);
                console.log(`Imagen eliminada de respaldo: ${imagen}`);
            }
        });

        // Leer las imágenes en la carpeta de origen
        fs.readdir(carpetaOriginal, (err, imagenesOriginal) => {
            if (err) {
                console.error('Error al leer la carpeta de origen:', err);
                return;
            }

            // Copiar las imágenes de origen a respaldo si no existen en respaldo
            imagenesOriginal.forEach(imagen => {
                const imagenOriginal = path.join(carpetaOriginal, imagen);
                const imagenRespaldo = path.join(carpetaRespaldo, imagen);

                if (!fs.existsSync(imagenRespaldo)) {
                    fs.copyFile(imagenOriginal, imagenRespaldo, err => {
                        if (err) {
                            console.error(`Error al copiar el archivo ${imagen}:`, err);
                        } else {
                            console.log(`Archivo ${imagen} copiado con éxito a ${carpetaRespaldo}`);
                        }
                    });
                } else {
                }
            });
        });
    });
});


// -----------------------------------------------------------------------------

app.get("/api/protection", (req, res) => {
    const tokenH = req.cookies.token;
    const id_user = req.cookies.id_user;

    if (!tokenH || !id_user) {
        return res.status(401).json({ message: "No estás logueado." });
    } else {
        try {
            db.get("SELECT cookieToken FROM Tokens WHERE id_user = ?", [id_user], async (err, row) => {
                if (err) {
                    return res.status(500).json({ message: "Error interno del sistema." });
                }
                if (!row) {
                    return res.status(404).json({ message: "No existes en el sistema." });
                } else {
                    const match = await bcrypt.compare(row.cookieToken, tokenH);
                    if (match) {
                        return res.status(200).json({ message: "Token verificado correctamente." });
                    } else {
                        return res.status(401).json({ message: "Token inválido." });
                    }
                }
            });
        } catch (err) {
            return res.status(500).json({ message: "Error interno del sistema." });
        }
    }
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
    const { contraUser, borrarRecetas } = req.body;
    const id_user = req.cookies.id_user;
    const usernameH = req.cookies.username;

    // Llamadas a base de datos
    // Borrado:
    const deleteQueryUsersTable = 'DELETE FROM Users WHERE id_user = ?';
    const deleteQueryTokensTable = 'DELETE FROM Tokens WHERE id_user = ?';
    const deleteQueryRecipeTable = "DELETE FROM Recipe WHERE username = ?";

    // Actualizar:
    const updateQueryRecipeTable = 'UPDATE Recipe SET username = ? WHERE username = ?';

    // Obtener Información:
    const getUsernameFromUsers = 'SELECT username FROM Users WHERE id_user = ?';
    const getPasswordFromUsers = "SELECT password FROM Users WHERE id_user = ?";

    // Validar datos necesarios
    if (!id_user || !contraUser || !usernameH) {
        return res.status(400).json({ message: "Falta proporcionar datos" });
    }

    if (borrarRecetas) {
        db.get(getPasswordFromUsers, [id_user], async (err, row) => {
            if (err) {
                return res.status(500).json({ message: "Error al obtener datos del usuario." });
            }
            if (!row) {
                res.clearCookie('id_user');
                res.clearCookie('username');
                res.clearCookie('token');
                return res.status(404).json({ message: "Usuario no encontrado." });
            }
            const matchP = await bcrypt.compare(contraUser, row.password);
            if (matchP){
                db.get(getUsernameFromUsers, [id_user], async (err, row) => {
                    if (err){
                        return res.status(500).json({ message: "Error al intentar obtener el nombre de usuario." });
                    }
                    if (!row){
                        return res.status(404).json({ message: "Error, no hay un nombre de usuario con ese id_user." });
                    }
                    else{
                        const matchUsername = await bcrypt.compare(row.username, usernameH);
                        if (matchUsername){
                            const usernameNH = row.username;
                            db.run(deleteQueryRecipeTable, [usernameNH], (err) => {
                                if (err){
                                    return res.status(500).json({ message: "No se ha podido eliminar la o las recetas a nombre del usuario." });
                                }
                                else {
                                    db.run(deleteQueryTokensTable, [id_user], (err) => {
                                        if (err){
                                            return res.status(500).json({ message: "No se ha podido eliminar al usuario de la tabla Tokens." });
                                        }
                                        else {
                                            db.run(deleteQueryUsersTable, [id_user], (err) => {
                                                if (err){
                                                    return res.status(500).json({ message: "No se ha podido eliminar al usuario de la tabla Users." });
                                                }
                                                else {
                                                    res.clearCookie("id_user");
                                                    res.clearCookie("username");
                                                    res.clearCookie("token");
                                                    return res.status(200).json({ message: "Se ha logrado con exito borrar las recetas, tokens y datos del usuario de la base de datos."});
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }
        })
    } else {
        db.get(getPasswordFromUsers, [id_user], async (err, row) => {
            if (err) {
                return res.status(500).json({ message: "Error al obtener datos del usuario." });
            }
            if (!row) {
                res.clearCookie('id_user');
                res.clearCookie('username');
                res.clearCookie('token');
                return res.status(404).json({ message: "Usuario no encontrado." });
            }
            const matchP = await bcrypt.compare(contraUser, row.password);
            if (matchP) {
                db.get(getUsernameFromUsers, [id_user], async (err, row) => {
                    if (err) {
                        return res.status(500).json({ message: "Error al obtener nombre de usuario." });
                    }
                    if (!row) {
                        return res.status(404).json({ message: "Nombre de usuario no encontrado." });
                    }

                    const matchUsername = await bcrypt.compare(row.username, usernameH);
                    const usernameNH = row.username;
                    if (matchUsername) {
                        // Actualiza las recetas del usuario antes de borrar el usuario
                        db.run(updateQueryRecipeTable, ["CocinApp", usernameNH], function (err) {
                            if (err) {
                                console.log("Error en la actualización de recetas:", err);
                                return res.status(500).json({ message: "Error al actualizar recetas a nombre de CocinApp." });
                            }

                            if (this.changes > 0) {
                                console.log(`Se actualizaron ${this.changes} recetas al usuario CocinApp.`);
                            } else {
                                console.log("No se encontraron recetas para actualizar.");
                            }

                            // Luego, elimina el token y el usuario
                            db.run(deleteQueryTokensTable, [id_user], (err) => {
                                if (err) {
                                    return res.status(500).json({ message: "Error al eliminar token." });
                                }

                                db.run(deleteQueryUsersTable, [id_user], (err) => {
                                    if (err) {
                                        return res.status(500).json({ message: "Error al eliminar usuario." });
                                    }

                                    // Limpia las cookies y responde con éxito
                                    res.clearCookie("id_user");
                                    res.clearCookie("username");
                                    res.clearCookie("token");
                                    return res.status(200).json({ message: "Usuario eliminado con éxito y recetas transferidas a CocinApp." });
                                });
                            });
                        });
                    } else {
                        return res.status(401).json({ message: "Verificación de nombre de usuario fallida." });
                    }
                });
            } else {
                return res.status(401).json({ message: "Contraseña incorrecta." });
            }
        });
    }
});



app.get('/api/info-usuario', async (req, res) => {
    const id_user = req.cookies.id_user;
    if (!id_user) {
        res.clearCookie('id_user');
        res.clearCookie('username');
        res.clearCookie('token');
        return res.json({ success: false, message: "No se indicó el id_user." });
    }

    try {
        db.get('SELECT username FROM Users WHERE id_user = ?', [id_user], (err, row) => {
            if (err || !row) {
                res.clearCookie('id_user');
                res.clearCookie('username');
                res.clearCookie('token');
                return res.json({ success: false, message: "Error al obtener usuario o usuario no encontrado." });
            }

            const { username } = row;
            return res.json({
                success: true,
                message: "Usuario obtenido con éxito.",
                username,
            });
        });
    } catch {
        res.clearCookie('id_user');
        res.clearCookie('username');
        res.clearCookie('token');
        return res.json({ success: false, message: "Error del servidor." });
    }
});



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
                    return res.status(404).json({ message: 'El usuario no exite' }); // Cambié '400' a '404'
                }
                if (row) {
                    const hashedPasswordDB = row.password;
                    const matchP = await bcrypt.compare(password, hashedPasswordDB);

                    if (matchP) {
                        return res.status(200).json({ message: 'Se ha iniciado sesión con exito.' });
                    }
                    else {
                        return res.status(400).json({ message: "Usuario o contraseña incorrecto" });
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
    const tokenNav = req.cookies.token;
    const usernameNav = req.cookies.username;
    const idUserNav = req.cookies.id_user;

    // Verificar que las cookies no están vacías
    if (!tokenNav || !usernameNav || !idUserNav) {
        res.clearCookie('id_user');
        res.clearCookie('username');
        res.clearCookie('token');
        return res.json({ success: false, message: "Error." });
    }

    const tiempoActual = new Date().toISOString();

    try {
        db.get('SELECT cookieToken, username, created_at FROM Tokens WHERE id_user = ?', [idUserNav], async function (err, row) {
            if (err || !row) {
                res.clearCookie('id_user');
                res.clearCookie('username');
                res.clearCookie('token');
                return res.status(400).json({ success: false, message: 'Error al obtener los datos del usuario o no se encontraron' });
            }

            // Comparar el token y el username con los valores en la base de datos
            const matchT = await bcrypt.compare(row.cookieToken, tokenNav);
            const usernameMatch = await bcrypt.compare(row.username, usernameNav);

            const tiempoExpirado = (createdAt, tiempoActual) => {
                const createdDate = new Date(createdAt);
                const currentDate = new Date(tiempoActual);
                const UnDiaMilisegundos = 24 * 60 * 60 * 1000;
                return (currentDate - createdDate) >= UnDiaMilisegundos;
            };

            if (tiempoExpirado(row.created_at, tiempoActual)) {
                db.run('UPDATE Tokens SET cookieToken = 0, created_at = 0 WHERE id_user = ?', [idUserNav], function (updateErr) {
                    if (!updateErr) {
                        res.clearCookie('id_user');
                        res.clearCookie('username');
                        res.clearCookie('token');
                        return res.status(400).json({ success: false, message: 'Token expirado y eliminado' });
                    }
                });
            } else if (matchT && usernameMatch) {
                return res.status(200).json({ success: true, message: 'Tokens válidos' });
            } else {
                res.clearCookie('id_user');
                res.clearCookie('username');
                res.clearCookie('token');
                return res.status(400).json({ success: false, message: 'Credenciales no válidas' });
            }
        });
    } catch (err) {
        res.clearCookie('id_user');
        res.clearCookie('username');
        res.clearCookie('token');
        return res.status(500).json({ success: false, message: 'Error interno en la validación', error: err });
    }
});




app.post('/api/cookie/delete', async (req, res) => {
    const id_user = req.cookies.id_user;
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
    const { usernameNH, page, ancho } = req.body;
    const pageNumber = parseInt(page) || 1;
    const limit = ancho === 1 ? 9 : 8;
    const offset = (pageNumber - 1) * limit;

    // Consulta para contar las recetas
    const countQuery = 'SELECT COUNT(*) AS total FROM Recipe WHERE username = ?';
    db.get(countQuery, [usernameNH], (err, countResult) => {
        if (err) {
            return res.status(500).json({ message: 'Error al contar las recetas.' });
        }

        const totalRecetas = countResult.total;

        // Consulta para obtener las recetas
        const getQuery = 'SELECT * FROM Recipe WHERE username = ? ORDER BY id_recipe DESC LIMIT ? OFFSET ?';
        db.all(getQuery, [usernameNH, limit, offset], (err, rows) => {
            if (err) {
                return res.status(500).json({ message: 'Error al determinar los datos de las recetas.' });
            }
            if (!rows){
                return res.status(404).json({ message: "No hay recetas para mostrar"});
            }
            return res.status(200).json({
                message: 'Se han encontrado todos los datos de la receta.',
                recetas: rows,
                totalPages: Math.ceil(totalRecetas / limit), // Total de páginas
            });
        });
    });
});



const safeString = (str) => {
    return str.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_').toLowerCase();
};

// Configuración de Multer con almacenamiento en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const resizeImage = (req, res, next) => {
    const username = req.body.username;
    const recipeName = req.body.recipeName;
    const imagen = req.file;
    
    if (!imagen) {
        return next();
    }

    try {
        
        db.get('SELECT recipe_name FROM Recipe WHERE username = ? AND recipe_name = ?', [username, recipeName], async (err, row) => {
            if (err) {
                console.error('Error al buscar receta en la base de datos:', err.message);
                return res.status(500).json({ message: "Error al buscar recetas", error: err.message });
            }

            if (row) {
                return res.status(400).json({ message: "Ya existe una receta con ese nombre." });
            } else {
                try {
                    const metadata = await sharp(imagen.buffer).metadata();
                    const targetWidth = 1280;
                    const targetHeight = 720;
                    
                    const replaceRecipeName = safeString(recipeName);
                    const replaceUsername = safeString(username);
                    const fileExtension = path.extname(imagen.originalname).toLowerCase();
                    const customFileName = `${replaceUsername}-${replaceRecipeName}-${Date.now()}.webp`;
                    const outputPath = path.join('../dist/', 'uploads', customFileName);
                    
                    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
                    if (imagen.size > MAX_FILE_SIZE) {
                        return res.status(400).json({ message: 'El archivo es demasiado grande. El tamaño máximo permitido es 4MB.' });
                    }
                    
                    if (metadata.width < targetWidth || metadata.height < targetHeight) {
                        return res.status(400).json({ message: `Las imágenes deben tener al menos 1280px de ancho y 720px de alto. Actual: ${metadata.width}x${metadata.height}` });
                    }
                    
                    if (fileExtension === ".webp") {
                        // Si es webp, solo redimensionamos si es necesario
                        await sharp(imagen.buffer)
                            .resize(targetWidth, targetHeight)
                            .toFile(outputPath)
                    } else {
                        // Convertimos a webp y redimensionamos si no es webp
                        await sharp(imagen.buffer)
                            .resize(targetWidth, targetHeight)
                            .webp({ quality: 80 })
                            .toFile(outputPath)
                    }
                    

                    imagen.path = outputPath;
                    next();
                } catch (error) {
                    console.error('Error al procesar la imagen:', error.message);
                    return res.status(500).json({ error: 'Error al procesar la imagen' });
                }
            }
        });
    } catch (error) {
        console.error('Error al procesar la imagen o al buscar receta:', error.message);
        return res.status(500).json({ error: error.message });
    }
};


app.post("/api/receta-nueva", upload.single('image'), resizeImage, (req, res) => {
    const { username, recipeName, difficulty, description, ingredients, steps, categories, tiempo } = req.body;

    // Asegura que 'ingredients', 'steps', y 'categories' sean arrays antes de convertirlos a string
    const ingredientsArray = Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(item => item.trim());
    const stepsArray = Array.isArray(steps) ? steps : steps.split(',').map(item => item.trim());
    const categoriesArray = Array.isArray(categories) ? categories : categories.split(',').map(item => item.trim());

    // Convierte los arrays en cadenas de texto separadas por comas con espacio después de la coma
    const ingredientsString = ingredientsArray.join(', ');
    const stepsString = stepsArray.join(', ');
    const categoriesString = categoriesArray.join(', '); // Asegura que haya espacio después de cada coma

    // Validación de parámetros requeridos
    const missingParams = [];
    if (!username) missingParams.push('username');
    if (!recipeName) missingParams.push('recipeName');
    if (!difficulty) missingParams.push('difficulty');
    if (!description) missingParams.push('description');
    if (!ingredientsString) missingParams.push('ingredients');
    if (!stepsString) missingParams.push('steps');
    if (!categoriesString) missingParams.push('categories');
    if (!tiempo) missingParams.push('tiempo');

    if (missingParams.length > 0) {
        return res.status(400).json({ message: `Faltan los siguientes parámetros: ${missingParams.join(', ')}` });
    }

    let rutaImagen = "";
    if (req.file) {
        const fileExtension = path.extname(req.file.path).toLowerCase();

        // Asignamos la ruta de la imagen
        rutaImagen = `/uploads/${path.basename(req.file.path)}`;
    } else {
        rutaImagen = '/assets/imagenDefault.webp';
    }

    const insertQuery = `INSERT INTO Recipe (username, recipe_name, difficulty, description, ingredients, steps, categories, tiempo, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [username, recipeName, difficulty, description, ingredientsString, stepsString, categoriesString, tiempo, rutaImagen];

    // Verificación de categorías
    const placeholders = categoriesArray.map(() => '?').join(',');
    const checkCategoriesQuery = `SELECT category FROM Categories WHERE category IN (${placeholders})`;

    db.all(checkCategoriesQuery, categoriesArray, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Error al verificar las categorías", error: err.message });
        }

        const existingCategories = rows.map(row => row.category);
        const missingCategories = categoriesArray.filter(cat => !existingCategories.includes(cat));
        if (missingCategories.length > 0) {
            return res.status(400).json({
                message: `Las siguientes categorías no existen: ${missingCategories.join(', ')}`,
            });
        }

        // Inserción en la base de datos
        db.run(insertQuery, values, function (err) {
            if (err) {
                return res.status(500).json({ message: 'Error al insertar receta', error: err.message });
            }
            return res.status(201).json({
                message: "Se ha creado la receta.",
                recetaId: this.lastID,
            });
        });
    });
});



const resizeImageEdited = async (req, res, next) => {
    const { username, recipeName, id_recipe } = req.body;
    const targetWidth = 1280;
    const targetHeight = 720;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB

    // Consulta para obtener el nombre de la receta y la imagen actual
    db.get('SELECT recipe_name, image FROM Recipe WHERE username = ? AND id_recipe = ?', [username, id_recipe], async (err, row) => {
        if (err) {
            console.error('Error al obtener datos de la receta:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (!row) {
            return res.status(404).json({ message: "Receta no encontrada" });
        }

        // Determinar si el nombre de la receta ha cambiado
        const recipeNameChanged = recipeName !== row.recipe_name;

        // Si hay un archivo nuevo, validar y procesarlo
        if (req.file) {
            const fileExtension = path.extname(req.file.originalname).toLowerCase();

            if (req.file.size > MAX_FILE_SIZE) {
                return res.status(400).json({ error: 'El archivo es demasiado grande' });
            }

            const metadata = await sharp(req.file.buffer).metadata();
            if (metadata.width < targetWidth || metadata.height < targetHeight) {
                return res.status(400).json({ message: "Las imágenes deben tener al menos 1280px de ancho y 720px de alto." });
            }

            // Construir el nuevo nombre de archivo y ruta de guardado
            const safeRecipeName = safeString(recipeName);
            const safeUsername = safeString(username);
            const outputFileName = `${safeUsername}-${safeRecipeName}-${Date.now()}.webp`;
            const outputPath = path.join("../dist/uploads", outputFileName);

            // Eliminar la imagen anterior si existe
            const imagenDBCompleto = row.image;
            const nombreImagen = imagenDBCompleto.replace('/uploads/', '');
            const imagenPath = path.join('../dist/uploads', nombreImagen);
            if (imagenDBCompleto === "/assets/imagenDefault.webp"){
                    await sharp(req.file.buffer)
                    .resize(targetWidth, targetHeight)
                    .toFormat('webp')
                    .webp({ quality: 80 })
                    .toFile(outputPath);
    
                    // Guardar la ruta relativa
                    const relativePath = path.join('uploads', outputFileName).replace(/\\/g, '/');
                    req.file.path = relativePath; // Almacenar la ruta relativa en req
                    return next(); // Continuar al siguiente middleware
            }

            if (fs.existsSync(imagenPath)) {
                fs.unlinkSync(imagenPath); // Eliminar la imagen anterior
                            // Procesar y guardar la nueva imagen
                await sharp(req.file.buffer)
                .resize(targetWidth, targetHeight)
                .toFormat('webp')
                .webp({ quality: 80 })
                .toFile(outputPath);

                // Guardar la ruta relativa
                const relativePath = path.join('uploads', outputFileName).replace(/\\/g, '/');
                req.file.path = relativePath; // Almacenar la ruta relativa en req
                return next(); // Continuar al siguiente middleware
            }

        } else if (recipeNameChanged) {
            // Si solo cambia el nombre de la receta y no se sube nueva imagen, renombrar la existente
            if (row.image === "/assets/imagenDefault.webp"){
                return next();
            }
            const imagenDBCompleto = row.image;
            const nombreImagen = imagenDBCompleto.replace('/uploads/', '');
            const imagenPath = path.join('../dist/uploads', nombreImagen);

            if (fs.existsSync(imagenPath)) {
                const safeRecipeName = safeString(recipeName);
                const safeUsername = safeString(username);
                const newFileName = `${safeUsername}-${safeRecipeName}-${Date.now()}.webp`;
                const newPath = path.join('../dist/uploads', newFileName);

                fs.renameSync(imagenPath, newPath);

                // Guardar la nueva ruta relativa en req
                req.file = { path: path.join('uploads', newFileName).replace(/\\/g, '/') };
            }
            return next(); // Continuar al siguiente middleware

        } else {
            // Si no se cambió el nombre de la receta ni se subió una nueva imagen, continuar sin cambios
            return next(); // Continuar al siguiente middleware
        }
    });
};



app.put('/api/actualizarReceta', upload.single('image'), resizeImageEdited, async (req, res) => {
    const { id_recipe, recipeName, difficulty, description, ingredients, steps, categories, tiempo, image } = req.body;

    try {
        const getImagePathQuery = 'SELECT image FROM Recipe WHERE id_recipe = ?';
        db.get(getImagePathQuery, [id_recipe], async (err, row) => {
            if (err) {
                return res.status(500).json({ message: 'Error al obtener la imagen actual.' });
            }
            if (!row) {
                return res.status(404).json({ message: 'Receta no encontrada.' });
            }

            // Si ingredients, steps o categories son cadenas, convertirlas a arrays
            const ingredientsArray = Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(item => item.trim());
            const stepsArray = Array.isArray(steps) ? steps : steps.split(',').map(item => item.trim());
            const categoriesArray = Array.isArray(categories) ? categories : categories.split(',').map(item => item.trim());

            const ingredientsString = ingredientsArray.join(', ');
            const stepsString = stepsArray.join(', ');
            const categoriesString = categoriesArray.join(', ');

            const newImagePath = req.file ? `/uploads/${path.basename(req.file.path)}` : row.image;

            const updateQuery = `UPDATE Recipe SET recipe_name = ?, difficulty = ?, description = ?, ingredients = ?, steps = ?, categories = ?, tiempo = ?, image = ? WHERE id_recipe = ?`;

            db.run(updateQuery, [
                recipeName,
                difficulty,
                description,
                ingredientsString,
                stepsString,
                categoriesString,
                tiempo,
                newImagePath,
                id_recipe,
            ], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al actualizar la receta.' });
                }
                return res.status(200).json({ message: 'Receta actualizada con éxito.' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.post("/api/eliminarReceta", (req, res) => {
    const { contraseña, id_recipe, username } = req.body;
    const id_user = req.cookies.id_user;

    if (!contraseña || !id_user || !id_recipe) {
        return res.status(400).json({ message: "Falta indicar datos." });
    }

    const getPasswordFromUsers = "SELECT password FROM Users WHERE id_user = ?";
    const getRecipeImageQuery = "SELECT image FROM Recipe WHERE id_recipe = ?";
    const deleteQueryRecipeTable = "DELETE FROM Recipe WHERE id_recipe = ?";

    // Primero, obtenemos la contraseña del usuario para verificarla.
    db.get(getPasswordFromUsers, [id_user], (err, userRow) => {
        if (err) {
            return res.status(500).json({ message: "Error al obtener los datos del usuario." });
        }

        if (!userRow) {
            return res.status(404).json({ message: "No se encontró el usuario." });
        }

        // Verificar si la contraseña es correcta
        bcrypt.compare(contraseña, userRow.password, (err, match) => {
            if (err) {
                return res.status(500).json({ message: "Error al comparar la contraseña." });
            }

            if (!match) {
                return res.status(400).json({ message: "Contraseña incorrecta." });
            }

            // Ahora que la contraseña es correcta, buscamos la ruta de la imagen asociada a la receta.
            db.get(getRecipeImageQuery, [id_recipe], (err, row) => {
                if (err) {
                    return res.status(500).json({ message: "Error al obtener la imagen de la DB." });
                }

                if (!row || !row.image || row.image === "/assets/imagenDefault.webp") {
                    // Si no hay imagen asociada, podemos proceder con la eliminación de la receta sin borrar la imagen.
                    db.run(deleteQueryRecipeTable, [id_recipe], (err) => {
                        if (err) {
                            console.log("Error al intentar eliminar la receta:", err);
                            return res.status(500).json({ message: "Error al intentar eliminar la receta." });
                        }
                        return res.status(200).json({ message: "Se eliminó correctamente la receta." });
                    });
                } else {
                    console.log(row.image);
                        const imagenPath = path.join('../', 'dist', row.image);  // row.image ya tiene la ruta completa
                        const imagenRespaldo = path.join('../public', row.image);

                    // Eliminar la imagen si existe
                    if (fs.existsSync(imagenPath)) {
                        fs.unlinkSync(imagenPath);
                    } else {
                        console.log("No se encontró la imagen en el sistema de archivos:", imagenPath);  // No se encontró la imagen
                    }

                    // Eliminar la receta de la base de datos
                    db.run(deleteQueryRecipeTable, [id_recipe], (err) => {
                        if (err) {
                            console.log("Error al intentar eliminar la receta:", err);
                            return res.status(500).json({ message: "Error al intentar eliminar la receta." });
                        }
                        return res.status(200).json({ message: "Se eliminó correctamente la receta y la imagen." });
                    });
                    }
                }
            )});
        });
    });





app.post('/api/receta-id', (req, res) => {
    const { id_recipe } = req.body;
    
    const query = 'SELECT * FROM Recipe WHERE id_recipe = ?';
    
    db.get(query, [id_recipe], (err, row) => {
        if (err) {
            return res.status(500).json({ message: "Error al obtener la receta." });
        }
        if (!row) {
            return res.status(404).json({ message: "Receta no encontrada." });
        }

        // Convertir ingredientes y pasos de cadenas a arrays
        const ingredients = row.ingredients.split(', ').map(item => item.trim());
        const steps = row.steps.split(', ').map(item => item.trim());

        // Si 'categories' es una cadena, convertirla en un array
        const categories = row.categories.split(',').map(item => item.trim());

        // Responder con los datos modificados
        return res.status(200).json({
            ...row,
            ingredients,
            steps,
            categories
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