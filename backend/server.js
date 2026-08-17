const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
 
const app = express();
app.use(cors());
app.use(express.json());

// Configuration de la connexion MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'smarttask_db',
    port: process.env.DB_PORT || 3306
};

let pool;

// Initialisation des données de base (User et Project par défaut)
async function initDb() {
    try {
        pool = mysql.createPool(dbConfig);
        
        // 1. Vérifier/Insérer un rôle
        await pool.query(
            `INSERT IGNORE INTO roles (id, name, description) VALUES (1, 'ROLE_USER', 'Utilisateur standard')`
        );

        // 2. Vérifier/Insérer un utilisateur par défaut
        await pool.query(
            `INSERT IGNORE INTO users (id, username, email, password_hash, role_id) 
             VALUES (1, 'default_user', 'user@smarttask.local', 'hash', 1)`
        );

        // 3. Vérifier/Insérer un projet par défaut
        await pool.query(
            `INSERT IGNORE INTO projects (id, name, description, owner_id) 
             VALUES (1, 'Projet Général', 'Projet par défaut pour les tâches', 1)`
        );

        console.log('✅ Base de données initialisée avec succès.');
    } catch (err) {
        console.error('❌ Erreur lors de l\'initialisation DB:', err);
    }
}

// Initialiser la connexion
initDb();

// --- ROUTES API ---

// Route de test
app.get('/api/health', (req, res) => {
    res.json({ message: "API SmartTask fonctionnelle !", status: "OK" });
});

// GET /api/tasks : Récupérer toutes les tâches
app.get('/api/tasks', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Erreur GET /api/tasks:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
    }
});

// POST /api/tasks : Créer une tâche
app.post('/api/tasks', async (req, res) => {
    const { title, priority, status } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Le titre est requis' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO tasks (title, priority, status, project_id, created_by) VALUES (?, ?, ?, 1, 1)`,
            [title, priority || 'medium', status || 'todo']
        );
        res.status(201).json({ id: result.insertId, title, priority, status });
    } catch (error) {
        console.error('Erreur POST /api/tasks:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la tâche' });
    }
});

// PUT /api/tasks/:id : Mettre à jour le statut d'une tâche
app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Tâche mise à jour avec succès' });
    } catch (error) {
        console.error('Erreur PUT /api/tasks/:id:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
});

// DELETE /api/tasks/:id : Supprimer une tâche
app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ message: 'Tâche supprimée avec succès' });
    } catch (error) {
        console.error('Erreur DELETE /api/tasks/:id:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
