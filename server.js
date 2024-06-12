const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 9797;

app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Mock users database
const users = {
    admin: '97979797',
    oswaldo: 'Mazda rx8'
};

// Middleware para verificar si el usuario está autenticado
function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// Ruta de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username] === password) {
        req.session.user = username;
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Ruta raíz redirige a la página de inicio de sesión si el usuario no está autenticado
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/index.html');
    } else {
        res.redirect('/login.html');
    }
});

// Ruta protegida para servir index.html
app.get('/index.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Función para guardar imágenes
const saveImage = (folder) => (req, res) => {
    const base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
    const filePath = `public/analisis/${folder}/imagen-${Date.now()}.png`;
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) return res.status(500).send(err);
        res.send('Imagen guardada con éxito!');
    });
};

// Rutas para guardar imágenes protegidas por middleware
app.post('/save-image', checkAuth, saveImage('Puente Nahualate'));
app.post('/save-image1', checkAuth, saveImage('Puente Ixtacapa'));
app.post('/save-image2', checkAuth, saveImage('Puente Teculután'));
app.post('/save-image3', checkAuth, saveImage('Puente Castillo Armas'));

// Función para listar imágenes
const listImages = (folder) => (req, res) => {
    const directoryPath = path.join(__dirname, 'public', 'analisis', folder);
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Error al leer el directorio');
        }
        res.json(files);
    });
};

// Rutas para listar imágenes protegidas por middleware
app.get('/list-images', checkAuth, listImages('Puente Nahualate'));
app.get('/list-images1', checkAuth, listImages('Puente Ixtacapa'));
app.get('/list-images2', checkAuth, listImages('Puente Teculután'));
app.get('/list-images3', checkAuth, listImages('Puente Castillo Armas'));

// Función para eliminar imágenes
const deleteImage = (folder) => (req, res) => {
    const fileName = req.body.fileName;
    const filePath = path.join(__dirname, 'public', 'analisis', folder, fileName);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error al eliminar la imagen:', err);
            return res.status(500).send('Error al eliminar la imagen');
        }
        res.send('Imagen eliminada con éxito!');
    });
};

// Rutas para eliminar imágenes protegidas por middleware
app.post('/delete-image', checkAuth, deleteImage('Puente Nahualate'));
app.post('/delete-image1', checkAuth, deleteImage('Puente Ixtacapa'));
app.post('/delete-image2', checkAuth, deleteImage('Puente Teculután'));
app.post('/delete-image3', checkAuth, deleteImage('Puente Castillo Armas'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});