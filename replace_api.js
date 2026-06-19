const fs = require('fs');
const files = [
    'app/santri/page.tsx', 
    'app/spp/page.tsx', 
    'app/pengurus/page.tsx', 
    'components/SantriTable.tsx', 
    'components/SPPChart.tsx', 
    'components/EditPengurusModal.tsx',
    'components/AddSantriModal.tsx',
    'components/SantriDetailModal.tsx'
];

files.forEach(f => {
    try {
        let p = 'd:\\M Lulu Khulaluddin\\DEVELOPER\\sim-ppds\\' + f;
        if (!fs.existsSync(p)) return;
        let content = fs.readFileSync(p, 'utf8');
        
        // Replace exact paths
        content = content.replace(/'\/api\/santri/g, "'https://api-worker.ppdslirboyo.workers.dev/api/santri");
        content = content.replace(/"\/api\/santri/g, '"https://api-worker.ppdslirboyo.workers.dev/api/santri');
        content = content.replace(/`\/api\/santri/g, '`https://api-worker.ppdslirboyo.workers.dev/api/santri');
        
        content = content.replace(/'\/api\/spp/g, "'https://api-worker.ppdslirboyo.workers.dev/api/spp");
        content = content.replace(/"\/api\/spp/g, '"https://api-worker.ppdslirboyo.workers.dev/api/spp');
        content = content.replace(/`\/api\/spp/g, '`https://api-worker.ppdslirboyo.workers.dev/api/spp');
        
        content = content.replace(/'\/api\/pengurus/g, "'https://api-worker.ppdslirboyo.workers.dev/api/pengurus");
        content = content.replace(/"\/api\/pengurus/g, '"https://api-worker.ppdslirboyo.workers.dev/api/pengurus');
        content = content.replace(/`\/api\/pengurus/g, '`https://api-worker.ppdslirboyo.workers.dev/api/pengurus');
        
        fs.writeFileSync(p, content);
        console.log('Updated ' + f);
    } catch(e) {
        console.error('Failed ' + f);
    }
});
