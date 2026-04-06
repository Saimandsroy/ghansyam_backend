const fs = require('fs');
let env = fs.readFileSync('.env', 'utf8');

if (env.includes('DB_NAME=mylocaldb')) {
    env = env.replace('DB_NAME=mylocaldb', '# DB_NAME=mylocaldb');
}
if (env.includes('# DB_NAME=workflow_production')) {
    env = env.replace('# DB_NAME=workflow_production', 'DB_NAME=workflow_production');
} else if (!env.includes('DB_NAME=workflow_production')) {
    env = env.replace('# DB_NAME=mylocaldb', '# DB_NAME=mylocaldb\nDB_NAME=workflow_production');
}

fs.writeFileSync('.env', env);
console.log('Restored .env to workflow_production');
