const { execSync } = require('child_process');

async function run() {
  console.log("Fetching deployments...");
  let deletedCount = 0;
  
  while (true) {
    try {
      const output = execSync('npx wrangler pages deployment list --project-name=sim-ppds --json', { encoding: 'utf-8' });
      const deployments = JSON.parse(output);
      
      if (deployments.length <= 1) {
        console.log("No more old deployments to delete.");
        break;
      }
      
      // Skip the first one as it's usually the latest active production deployment
      const toDelete = deployments.slice(1);
      
      if (toDelete.length === 0) {
        break;
      }

      console.log(`Found ${toDelete.length} old deployments in this batch. Deleting...`);
      
      for (const dep of toDelete) {
        console.log(`Deleting ${dep.Id} (Status: ${dep.Status}, Branch: ${dep.Branch})...`);
        try {
          execSync(`npx wrangler pages deployment delete ${dep.Id} --project-name=sim-ppds --force`);
          deletedCount++;
        } catch (e) {
          console.error(`Failed to delete ${dep.Id}:`, e.message);
        }
      }
      
    } catch (err) {
      console.error("Error fetching deployments:", err.message);
      break;
    }
  }
  
  console.log(`\nFinished! Deleted ${deletedCount} old deployments.`);
}

run();
