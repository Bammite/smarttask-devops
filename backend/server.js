const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuration de la connexion MySQL (utilise les variables d'environnement Docker)
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'smartuser',
  password: process.env.DB_PASSWORD || 'smartpassword',
  database: process.env.DB_NAME || 'smarttask_db'
};

let db;

// Connexion à la base de données avec reconnexion automatique
async function connectDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Connecté à la base de données MySQL');
  } catch (err) {
    console.error('❌ Échec de connexion MySQL, nouvelle tentative dans 5s...', err.message);
    setTimeout(connectDB, 5000);
  }
}
connectDB();

// --- ROUTES DE L'API REST ---

// 1. Récupérer toutes les tâches
app.get('/api/tasks', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Créer une nouvelle tâche
app.post('/api/tasks', async (req, res) => {
  const { title, priority, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Le titre est obligatoire' });
  }

  try {
    // Par défaut, rattachement au projet 1 et créateur 1 pour les tests
    const query = 'INSERT INTO tasks (title, priority, status, project_id, created_by) VALUES (?, ?, ?, 1, 1)';
    const [result] = await db.query(query, [title, priority || 'medium', status || 'todo']);
    
    res.status(201).json({ id: result.insertId, title, priority, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Mettre à jour le statut d'une tâche
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Tâche mise à jour avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Supprimer une tâche
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Backend SmartTask à l'écoute sur le port ${PORT}`);
});
