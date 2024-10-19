const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const env  = require('dotenv'); 
const {createConnection} = require('mysql2');
const app  = express();
const PORT = 5000;
const host = 'http://pruebita.webhop.me';
// const host = 'http://localhost';
env.config(); //Variables de entorno

// CONEXION DB
const db = createConnection({
    host : process.env.HOST,
    port : process.env.PORT,
    user : process.env.USER,
    password : process.env.PASSWD,
    database : process.env.DB
});


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

// const db = new sqlite3.Database('./BasedeDatos.db');
// const db = new sqlite3.Database('./db.db');

app.get('/api/usuarios', (req, res) => {
    db.query('SELECT id_user, username FROM Users', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/categorias', (req, res) => {
    const query = 'SELECT category FROM Categories'; // Ajuste en el nombre de la tabla y columna
    db.query(query, [], (err, rows) => {
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


app.post('/api/login',  (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) { // Cambié '&&' a '||' para verificar que ambas variables son necesarias
        return res.status(400).json({ message: 'No se ha indicado un nombre o contraseña.' });
    }

        const passwordQuery = 'SELECT passwd FROM Users WHERE username = ?';

        db.execute(passwordQuery, [username], async (err, rows) => {
            if (err) {
                console.error('Error al buscar la contraseña del usuario:', err.message); // Log adicional
                return res.status(500).json({ message: 'Error al buscar el usuario. 500' });
            }
            
            // Verifica si no se encontraron filas
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado. 404' });
            }
            
            // Si hay una fila, obtén la contraseña
            const hashedPasswordDB = rows[0].passwd; // Accede al campo "passwd"
            console.log(hashedPasswordDB);
        
            // Compara la contraseña ingresada con la almacenada
            const matchP = await bcrypt.compare(password, hashedPasswordDB);
        
            if (matchP) {
                return res.status(200).json({ message: 'Se ha iniciado sesión con éxito.' });
            } else {
                return res.status(401).json({ message: 'Contraseña incorrecta.' });
            }
        });
});


app.post('/api/register', (req, res) => {
    const { usernameR, passwordR, passwordRC } = req.body;

    // Validaciones iniciales
    if (!usernameR || !passwordR || !passwordRC) {
        return res.status(400).json({ message: 'Faltan el nombre de usuario o la contraseña. 400' });
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
        db.execute(query, [usernameR], async (err, row) => {
            if (err) {
                return res.status(500).json({ message: 'Error al buscar el usuario. 500' });
            }
            if (row.length > 0) {
                return res.status(400).json({ message: 'El nombre de usuario ya está en uso. 400' });
            } else {
                try {
                    const hashedPasswordR = await bcrypt.hash(passwordR, 10);
                    db.execute('INSERT INTO Users (username, passwd) VALUES (?, ?)', [usernameR, hashedPasswordR], function(err) {
                        if (err) {
                            console.error('Error al crear usuario:', err.message);
                            if (err.code !== 'SQLITE_CONSTRAINT') {
                                return res.status(500).json({ message: 'Error al crear usuario. 500', error: err.message });
                            }
                        }
                        const userId = row.lastID;
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
        db.execute('Select * FROM Users WHERE username = ?', [nombre], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al cerrar sesión.' });
            }
            res.status(200).json({ message: 'Sesión cerrada correctamente.' });
        });
    }
});

app.delete('/api/delete', (req, res) => {
    const { nombre } = req.body;
    if (nombre) {
        const deleteQuery = 'DELETE FROM Users WHERE username = ?';
        db.execute(deleteQuery, [nombre], function (err) {
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
    const { storedUsername } = req.body;
    const checkQuery = 'SELECT username FROM Users WHERE username = ?';
    db.execute(checkQuery, [storedUsername], function (err, row) {
        if (err) {
            return res.status(500).json({ message: 'Error al determinar el estado de la cuenta.' });
        }
        if (!row) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        if (row) {
            return res.status(200).json({ message: 'Usuario encontrado exitosamente.' });
        }
    });
});



// app.get(`/api/recetas/:${id_}`)

// EN DESUSO
app.post('/api/cookie', (req, res) => {
    const { nombre } = req.body;
    if (!nombre){
        return res.status(400).json({ message: 'Error, no hay nombre de usuario.'});
    } else {
        db.execute('UPDATE Users SET loggedIn = 0 WHERE username = ?', [nombre], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al cerrar sesión.' });
            }
            res.status(200).json({ message: 'Sesión cerrada correctamente.' });
        });
    }
});


// ------------------------ API REST (Recetas) -------------------------
app.get('/api/recetas', (req, res) => {
    const getQuery = 'SELECT * FROM Receta';
    db.query(getQuery, [], (err, rows) => {
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


app.get('/api/receta/:id', (req, res) => {
    const { id } = req.params; // req.params es un objeto, no una función
    const getQuery = 'SELECT * FROM Recipe WHERE id_recipe = ?';
    db.query(getQuery, [id], (err, rows) => {
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