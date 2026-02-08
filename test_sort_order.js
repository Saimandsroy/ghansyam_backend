
const { Pool } = require('pg');
const dotenv = require('dotenv');
const Task = require('./models/Task');

dotenv.config();

// Mock query function since Task model uses it from config/database
// ref: const { query, transaction } = require('../config/database');
// We need to ensure we're using the real database connection

async function testFindAll() {
    try {
        console.log("Searching for a writer user...");
        // Get a writer
        const pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });

        const writerRes = await pool.query("SELECT id, name FROM users WHERE LOWER(role) = 'writer' OR role ILIKE 'writer' LIMIT 1");
        if (writerRes.rows.length === 0) {
            console.log("No writer found.");
            process.exit(1);
        }

        const writer = writerRes.rows[0];
        console.log(`Found Writer: ${writer.name} (ID: ${writer.id})`);

        console.log("\nCalling Task.findAll for this writer...");
        const tasks = await Task.findAll({ assigned_writer_id: writer.id });

        console.log(`\nFound ${tasks.length} tasks.`);
        console.log("Top 5 tasks (should be latest first):");
        tasks.slice(0, 5).forEach(t => {
            console.log(`ID: ${t.id} | Created: ${t.created_at} | Updated: ${t.updated_at} | Client: ${t.client_name}`);
        });

        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

testFindAll();
