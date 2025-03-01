// Created by Famous-Tech 
// Comments are in English and french if you can't understand, Goodbye !
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./database');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Fix: Trust the first proxy
app.set('trust proxy', 1);

// Middleware to parse JSON (French: Middleware pour parser le JSON)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory (French: Servir les fichiers statiques du dossier public)
app.use(express.static(path.join(__dirname, 'public')));

// Configuration du rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requêtes maximum par fenêtre (English Max: 10 requests per window)
    message: {
        error: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.'
    }
});

// Appliquer le rate limiting aux routes /api
app.use('/api', limiter);

// Main route that serves the index.html file (French: Route principale qui sert le fichier index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to submit a new applicant (French: Route pour soumettre un nouveau candidat)
app.post('/api/applicants', async (req, res) => {
    try {
        const { name, email, whatsapp, github, expertise, experience, message } = req.body;
        
        // Required data validation (French: Vérification des données requises)
        if (!name || !email) {
            return res.status(400).json({ error: 'Nqme and Email are required' });
        }

        // Vérifier si l'email existe déjà
        const emailExists = await db.checkExistingEmail(email);
        if (emailExists) {
            return res.status(409).json({ 
                error: 'Vous avez déjà postulé avec cette adresse email'
            });
        }
        
        const newApplicant = await db.addApplicant({
            name,
            email,
            whatsapp,
            github,
            expertise,
            experience,
            message
        });
        
        res.status(201).json({ success: true, applicant: newApplicant });
    } catch (error) {
        console.error('Error adding applicant:', error); // (French: Erreur lors de l\'ajout d\'un candidat:)
        res.status(500).json({ error: 'Server error while adding the applicant' });
    }
});
// Admin route
// Route to serve the admin panel (French: Route pour servir le panneau d'administration)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});


app.put('/api/applicants/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate the status (French: Vérification du statut)
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' });
        }

        const client = await pool.connect();
        try {
            const result = await client.query(
                'UPDATE applicants SET status = $1 WHERE id = $2 RETURNING *',
                [status, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Candidat non trouvé' });
            }

            res.json({ success: true, applicant: result.rows[0] });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du statut' });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du statut' });
    }
});

// Route to retrieve all applicants (French: Route pour récupérer tous les candidats)
app.get('/api/applicants', async (req, res) => {
    try {
        const applicants = await db.getAllApplicants();
        res.json(applicants);
    } catch (error) {
        console.error('Error retrieving applicants:', error); // (French: Erreur lors de la récupération des candidats:)
        res.status(500).json({ error: 'Server error while retrieving applicants' });
    }
});

// Route to retrieve a specific applicant (French: Route pour récupérer un candidat spécifique)
app.get('/api/applicants/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const applicant = await db.getApplicantById(id);
        
        if (!applicant) {
            return res.status(404).json({ error: 'Applicant not found' });
        }
        
        res.json(applicant);
    } catch (error) {
        console.error('Error retrieving applicant:', error); // (French: Erreur lors de la récupération du candidat:)
        res.status(500).json({ error: 'Server error while retrieving the applicant' });
    }
});

// Route to retrieve all applicants with optional status filter (French: Route pour récupérer tous les candidats avec filtre optionnel par statut)
app.get('/api/applicants', async (req, res) => {
    try {
        const { status } = req.query;
        let query = 'SELECT * FROM applicants';
        let params = [];

        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const client = await pool.connect();
        try {
            const result = await client.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Erreur lors de la récupération des candidats:', error);
            res.status(500).json({ error: 'Erreur serveur lors de la récupération des candidats' });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des candidats:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des candidats' });
    }
});

// Initialize the database and start the server (French: Initialisation de la base de données et démarrage du serveur)
db.initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`); // (French: Serveur démarré sur le port ${PORT})
           // console.log('DATABASE_URL:', process.env.DATABASE_URL); The problem is  resolved
        });
    })
    .catch(err => {
        console.error('Error initializing database:', err); // (French: Erreur lors de l\'initialisation de la base de données:)
        process.exit(1);
    });
