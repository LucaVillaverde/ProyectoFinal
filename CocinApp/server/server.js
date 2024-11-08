const express = require('express');

const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path')
const app = express();
app.use(cookieParser());
require('dotenv').config();
// PORTS
const PORT = 5000;
const PORT_FRONTEND = 4173
const pathImages = '../public';
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


console.log(pathImages)

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



cron.schedule('*/1 * * * *', () => { //Tarea ejecutada cada 1 minuto
    db.run('UPDATE Tokens SET cookieToken = 0, created_at = 0 WHERE julianday(\'now\') - julianday(created_at) >= 1', (err) => {
        if (err) {
            return console.error('Error al actualizar cookieToken:', err.message);
        }
    });
});


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

app.post("/api/eliminarReceta", (req, res) => {
    const { contraseña, id_recipe } = req.body;
    const id_user = req.cookies.id_user;

    if(!contraseña || !id_user || !id_recipe){
        return res.status(400).json({ message: "Falta indicar datos." });
    }

    const getPasswordFromUsers = "SELECT password FROM Users WHERE id_user = ?";
    const deleteQueryRecipeTable = "DELETE FROM Recipe WHERE id_recipe = ?";

    try{
        db.get(getPasswordFromUsers, [id_user], async (err, row) => {
            if (err) {
                return res.status(500).json({ message: "Algo salio mal Hola." });
            }
            if (!row) {
                return res.status(404).json({ message: "No hay datos existentes." });
            }
            else {
                const match = await bcrypt.compare(contraseña, row.password);
                if (match){
                    try{
                        db.run(deleteQueryRecipeTable, [id_recipe], (err) => {
                            if (err) {
                                return res.status(500).json({ message: "Error al intentar eliminar la receta." });
                            }
                            else {
                                return res.status(200).json({ message: "Se elimino correctamente la receta." });
                            }
                        })
                    }catch{
                        return res.status(500).json({ message: "Error al intentar eliminar la receta." });
                    }
                }
            }
        })
    }catch{
        return res.status(500).json({ message: "Algo salio mal." });
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
    return str.replace(/[^\w\s]/gi, ''); // Eliminar caracteres especiales
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');  // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        // Obtener los valores de 'recipe_name' y 'username' de los datos enviados
        const recipeName = safeString(req.body.recipeName.replace(/\s+/g, '_').toLowerCase());  // Reemplaza los espacios por guiones bajos y pasa a minúsculas
        const username = safeString(req.body.username.replace(/\s+/g, '_').toLowerCase());  // Lo mismo para el nombre de usuario
        const fileExtension = path.extname(file.originalname).toLowerCase();  // Obtener la extensión original del archivo (por ejemplo, .jpg, .png)

        // Crear el nombre del archivo usando el nombre de la receta, el nombre de usuario y un timestamp para hacerlo único
        const customFileName = `${username}_${recipeName}${fileExtension}`;
        cb(null, customFileName);  // Usar el nombre personalizado
    }
});

const upload = multer({ storage: storage });

app.post("/api/receta-nueva", upload.single('image'), (req, res) => {
    // Verificar que los parámetros están presentes
    console.log(req.file);  // Verificar si la imagen fue recibida correctamente

    const { username, recipeName, difficulty, description, ingredients, steps, categories, tiempo } = req.body;

    // Validar que todos los parámetros requeridos estén presentes
    const missingParams = [];
    if (!username) missingParams.push('username');
    if (!recipeName) missingParams.push('recipeName');
    if (!difficulty) missingParams.push('difficulty');
    if (!description) missingParams.push('description');
    if (!ingredients) missingParams.push('ingredients');
    if (!steps) missingParams.push('steps');
    if (!categories) missingParams.push('categories');
    if (!tiempo) missingParams.push('tiempo');

    if (missingParams.length > 0) {
        return res.status(400).json({
            message: `Faltan los siguientes parámetros: ${missingParams.join(', ')}`,
        });
    }

    // Tratar ingredientes y pasos como arrays
    const ingredientsArray = ingredients.split(',').map(ingredient => ingredient.trim());
    const stepsArray = steps.split(',').map(step => step.trim());
    const categoryArray = categories.split(',').map(category => category.trim());

    // Comprobación de categorías
    const placeholders = categoryArray.map(() => '?').join(',');
    const checkCategoriesQuery = `SELECT category FROM Categories WHERE category IN (${placeholders})`;

    let insertQuery = "";
    let values = [];
    let rutaImagen = "";

    // Validación de la imagen
    if (req.file) {
        const imageMulter = req.file.filename;
        const validExtensions = ['.jpg', '.webp', '.png']; // Lista de extensiones válidas
        const fileExtension = path.extname(imageMulter).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            return res.status(400).json({ message: "Formato de imagen no válido" });
        }

        // Si la imagen es válida, asignamos el nombre del archivo a rutaImagen
        rutaImagen = `../../server/uploads/${req.file.filename}`;
        values = [
            username,
            recipeName,
            difficulty,
            description,
            ingredientsArray.join(', '),
            stepsArray.join(', '),
            categoryArray.join(', '),
            tiempo,
            rutaImagen,
        ];
        insertQuery = `INSERT INTO Recipe (username, recipe_name, difficulty, description, ingredients, steps, categories, tiempo, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    } else {
        // Si no hay imagen, insertar sin la columna de imagen
        values = [
            username,
            recipeName,
            difficulty,
            description,
            ingredientsArray.join(', '),
            stepsArray.join(', '),
            categoryArray.join(', '),
            tiempo,
        ];
        insertQuery = `INSERT INTO Recipe (username, recipe_name, difficulty, description, ingredients, steps, categories, tiempo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    }

    // Insertar en la base de datos
    try {
        db.get('SELECT recipe_name FROM Recipe WHERE username = ? AND recipe_name = ?', [username, recipeName], (err, row) => {
            if (err) {
                return res.status(500).json({ message: "Error al buscar recetas", error: err.message });
            }
            if (row) {
                return res.status(400).json({ message: "Ya existe una receta con ese nombre." });
            } else {
                db.all(checkCategoriesQuery, categoryArray, (err, rows) => {
                    if (err) {
                        return res.status(500).json({ message: "Error al verificar las categorías", error: err.message });
                    }

                    const existingCategories = rows.map(row => row.category);
                    const missingCategories = categoryArray.filter(cat => !existingCategories.includes(cat));

                    if (missingCategories.length > 0) {
                        return res.status(400).json({
                            message: `Las siguientes categorías no existen: ${missingCategories.join(', ')}`
                        });
                    }

                    // Insertar en la base de datos
                    db.run(insertQuery, values, function (err) {
                        if (err) {
                            return res.status(500).json({ message: 'Error al insertar receta', error: err.message });
                        }

                        return res.status(201).json({
                            message: "Se ha creado la receta.",
                            recetaId: this.lastID
                        });
                    });
                });
            }
        });
    } catch (err) {
        return res.status(500).json({ message: "Ha ocurrido un error inesperado.", error: err.message });
    }
});


  


app.put('/api/actualizarReceta', (req, res) => {
    const { formData, id_recipe } = req.body;
    console.log(id_recipe);

    if (!formData.recipe_name || !formData.difficulty || !formData.categories || !formData.description || !formData.ingredients || !formData.steps || !formData.tiempo || !id_recipe){
        return res.status(400).json({ message: "No se tienen los datos necesarios." });
    }

    if (formData.recipe_name.length < 3 || formData.description.length < 3){
        return res.status(400).json({ message: "El nombre o la descripcion son muy cortos." });
    }

    // Validar que ingredients y steps son arrays y que no estén vacíos
    if (!Array.isArray(formData.ingredients) || formData.ingredients.length === 0) {
        return res.status(400).json({ message: "Se deben proporcionar ingredientes." });
    }

    if (!Array.isArray(formData.steps) || formData.steps.length === 0) {
        return res.status(400).json({ message: "Se deben proporcionar pasos." });
    }

    // Validar que no haya más de 12 ingredientes o pasos
    if (formData.ingredients.length > 12) {
        return res.status(400).json({ message: "No se pueden agregar más de 12 ingredientes." });
    }

    if (formData.steps.length > 12) {
        return res.status(400).json({ message: "No se pueden agregar más de 12 pasos." });
    }

    // Asegurarse de que categories sea un array
    const categoriesArray = Array.isArray(formData.categories) ? formData.categories : formData.categories.split(',').map(item => item.trim());

    // Convertir ingredientes y pasos a cadenas para almacenarlos en la base de datos
    const ingredientsString = formData.ingredients.join(', '); // Por ejemplo: 'ingrediente1, ingrediente2'
    const stepsString = formData.steps.join(', ');

    // Convertir categorías a una cadena separada por comas
    const categoriesString = categoriesArray.join(', '); // Por ejemplo: 'Plato Principal, Sopa'

    const updateQueryRecipeTable = 'UPDATE Recipe SET recipe_name = ?, difficulty = ?, description = ?, ingredients = ?, steps = ?, categories = ?, tiempo = ? WHERE id_recipe = ?';
    db.run(updateQueryRecipeTable, [formData.recipe_name, formData.difficulty, formData.description, ingredientsString, stepsString, categoriesString, formData.tiempo, id_recipe], (err, row) => {
        if (err) {
            return res.status(500).json({ message: "Error al actualizar la receta." });
        }
        if (!row) {
            return res.status(404).json({ message: "No se encontro la receta a actualizar." });
        } else {
            return res.status(200).json({ message: "Se ha actualizado con exito." });
        }
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