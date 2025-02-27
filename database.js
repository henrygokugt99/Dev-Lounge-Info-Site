const { Pool } = require('pg');
require('dotenv').config();

// Configuration de la connexion à PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialisation de la base de données
async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS applicants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        whatsapp VARCHAR(50),
        github VARCHAR(100),
        expertise VARCHAR(200),
        experience INTEGER,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table applicants créée ou déjà existante');
  } catch (error) {
    console.error('Erreur lors de la création de la table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Ajouter un nouveau candidat
async function initDatabase() {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS applicants (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          whatsapp VARCHAR(50),
          github VARCHAR(100),
          expertise VARCHAR(200),
          experience INTEGER,
          message TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Table applicants créée ou déjà existante');
    } catch (error) {
      console.error('Erreur lors de la création de la table:', error);
      throw error;
    } finally {
      client.release();
    }
  }

// Récupérer tous les candidats
async function getAllApplicants() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM applicants ORDER BY created_at DESC'
    );
    
    return result.rows;
  } catch (error) {
    console.error('Erreur lors de la récupération des candidats:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Récupérer un candidat par son ID
async function getApplicantById(id) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM applicants WHERE id = $1',
      [id]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la récupération du candidat:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function addApplicant(applicantData) {
    const { name, email, whatsapp, github, expertise, experience, message } = applicantData;
    
    const client = await pool.connect();
    try {
        const result = await client.query(
            `INSERT INTO applicants (name, email, whatsapp, github, expertise, experience, message, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
             RETURNING *`,
            [name, email, whatsapp, github, expertise, experience, message]
        );
        
        console.log('Nouveau candidat inscrit:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error('Erreur lors de l\'ajout d\'un candidat:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
  initDatabase,
  addApplicant,
  getAllApplicants,
  getApplicantById
};