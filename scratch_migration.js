const fs = require('fs');
const path = require('path');

const root = 'd:\\M Lulu Khulaluddin\\DEVELOPER\\sim-ppds';
const apiDir = path.join(root, 'app', 'api');
const workerSrc = path.join(root, 'api-worker', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('route.ts')) results.push(file);
        }
    });
    return results;
}

const routes = walk(apiDir);
console.log('Found', routes.length, 'routes');

let allRoutes = [];

routes.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(apiDir, path.dirname(file)).replace(/\\/g, '/');
        
        // Skip root api/route.ts if any
        if (relativePath === '') return;
        
        const parts = relativePath.split('/');
        const routeName = parts[parts.length - 1] || 'index';
        
        // Transform imports
        let newContent = content
            .replace(/import { NextResponse } from ['"]next\/server['"];?/g, 'import { Context } from \'hono\';\nimport { Env } from \'../../index\';')
            .replace(/import { getRequestContext }.*?;?/g, '')
            .replace(/export const runtime = .*?;?/g, '');
            
        // Transform function signatures
        newContent = newContent.replace(/export async function (GET|POST|PUT|DELETE|PATCH)\(req: Request(.*?)\) {/g, (match, method) => {
            return `export const ${method.toLowerCase()}${routeName.charAt(0).toUpperCase() + routeName.slice(1)} = async (c: Context<{Bindings: Env}>) => {\n  const req = c.req.raw;`;
        });
        
        // Transform env DB
        newContent = newContent.replace(/const { env } = getRequestContext\(\);?/g, 'const env = c.env;');
        
        // Replace NextResponse.json(...) with c.json(...)
        newContent = newContent.replace(/NextResponse\.json\((.*?)\)/g, 'c.json($1)');
        
        // Save controller
        const ctrlDir = path.join(workerSrc, 'controllers', path.dirname(relativePath));
        fs.mkdirSync(ctrlDir, { recursive: true });
        fs.writeFileSync(path.join(ctrlDir, routeName + 'Controller.ts'), newContent);
        
        // Generate route
        let routeContent = `import { Hono } from 'hono';\nimport { Env } from '../../index';\nimport * as controller from '../controllers/${relativePath.includes('/') ? path.dirname(relativePath) + '/' : ''}${routeName}Controller';\n\nconst route = new Hono<{ Bindings: Env }>();\n`;
        
        const methods = ['get', 'post', 'put', 'delete', 'patch'];
        let hasMethods = false;
        methods.forEach(m => {
            const fnName = `${m}${routeName.charAt(0).toUpperCase() + routeName.slice(1)}`;
            if (newContent.includes(`export const ${fnName}`)) {
                routeContent += `route.${m}('/', controller.${fnName});\n`;
                hasMethods = true;
            }
        });
        
        if (hasMethods) {
            const rDir = path.join(workerSrc, 'routes', path.dirname(relativePath));
            fs.mkdirSync(rDir, { recursive: true });
            fs.writeFileSync(path.join(rDir, routeName + '.ts'), routeContent + '\nexport default route;\n');
            allRoutes.push(relativePath);
        }
    } catch(e) {
        console.error("Error with file", file, e);
    }
});

console.log('Migrated routes:', allRoutes);
