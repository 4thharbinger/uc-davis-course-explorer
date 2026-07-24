const { spawn, execSync } = require('child_process');
const fs = require('fs');

let studioProcess = null;

function startStudio() {
    console.log('\n🚀 Starting Prisma Studio...');
    // 'shell: true' is required on Windows to properly execute 'npx' commands
    studioProcess = spawn('npx', ['prisma', 'studio'], { stdio: 'inherit', shell: true });
}

function handleSchemaChange() {
    console.log('\n🔄 Schema change detected! Stopping Prisma Studio...');
    
    if (studioProcess) {
        // Kill the existing studio process so it frees up port 5555
        studioProcess.kill();
    }

    try {
        console.log('📡 Pushing schema to database...');
        execSync('npx prisma db push', { stdio: 'inherit' });
        
        // console.log('⚙️ Generating Prisma Client...');
        // execSync('npx prisma generate', { stdio: 'inherit' });
        
        // Only restart studio if the push and generate were successful
        startStudio();
    } catch (error) {
        console.error('\n❌ Error pushing schema. Fix your schema.prisma file and save again to retry.');
    }
}

// Initial start
startStudio();

// Watch the file with a debounce so it doesn't trigger twice if your IDE auto-saves
let debounceTimeout;
fs.watch('./prisma/schema.prisma', (eventType, filename) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        handleSchemaChange();
    }, 500); 
});

console.log('👀 Watching prisma/schema.prisma for changes...');