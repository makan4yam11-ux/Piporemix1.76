import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.cache', '.config', '.local', '.upm',
  'dist', 'build', '.next', 'attached_assets', 'uploads'
]);

const IGNORE_FILES = new Set([
  '.env', '.replit', 'package-lock.json'
]);

function shouldIgnore(filePath: string): boolean {
  const parts = filePath.split('/');
  for (const part of parts) {
    if (IGNORE_DIRS.has(part)) return true;
  }
  const fileName = path.basename(filePath);
  if (IGNORE_FILES.has(fileName)) return true;
  if (fileName.endsWith('.log')) return true;
  const stat = fs.statSync(path.join('/home/runner/workspace', filePath));
  if (stat.size > 5 * 1024 * 1024) return true;
  return false;
}

function getAllFiles(dir: string, baseDir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (IGNORE_DIRS.has(entry.name)) continue;
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      if (!shouldIgnore(relativePath)) {
        files.push(relativePath);
      }
    }
  }
  return files;
}

function isBinaryFile(filePath: string): boolean {
  const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.woff', '.woff2', '.ttf', '.eot', '.mp3', '.mp4', '.zip', '.tar', '.gz'];
  return binaryExts.some(ext => filePath.toLowerCase().endsWith(ext));
}

async function uploadBatch(octokit: Octokit, owner: string, repo: string, files: string[], projectDir: string) {
  const results = [];
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (file) => {
      const fullPath = path.join(projectDir, file);
      const binary = isBinaryFile(file);
      
      try {
        if (binary) {
          const content = fs.readFileSync(fullPath);
          const blob = await octokit.rest.git.createBlob({
            owner, repo,
            content: content.toString('base64'),
            encoding: 'base64',
          });
          return { path: file, mode: '100644' as const, type: 'blob' as const, sha: blob.data.sha };
        } else {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const blob = await octokit.rest.git.createBlob({
            owner, repo, content,
            encoding: 'utf-8',
          });
          return { path: file, mode: '100644' as const, type: 'blob' as const, sha: blob.data.sha };
        }
      } catch (e) {
        console.log(`  Skipping ${file} (error reading)`);
        return null;
      }
    });
    
    const batchResults = await Promise.all(promises);
    for (const r of batchResults) {
      if (r) results.push(r);
    }
    console.log(`  Uploaded ${Math.min(i + BATCH_SIZE, files.length)}/${files.length} files...`);
  }
  
  return results;
}

async function main() {
  const owner = 'makan4yam11-ux';
  const repo = 'Piporemix1.76';
  const branch = 'main';
  const projectDir = '/home/runner/workspace';

  console.log('Connecting to GitHub...');
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });

  const user = await octokit.rest.users.getAuthenticated();
  console.log(`Authenticated as: ${user.data.login}`);

  try {
    await octokit.rest.repos.get({ owner, repo });
    console.log(`Repository ${owner}/${repo} found.`);
  } catch (e: any) {
    if (e.status === 404) {
      console.log(`Creating ${owner}/${repo}...`);
      await octokit.rest.repos.createForAuthenticatedUser({
        name: repo, private: false, auto_init: true,
      });
      console.log('Repository created!');
      await new Promise(r => setTimeout(r, 2000));
    } else {
      throw e;
    }
  }

  console.log('Collecting project files...');
  const files = getAllFiles(projectDir, projectDir);
  console.log(`Found ${files.length} files to upload.`);

  console.log('Uploading files...');
  const treeItems = await uploadBatch(octokit, owner, repo, files, projectDir);

  console.log('Creating git tree...');
  const tree = await octokit.rest.git.createTree({
    owner, repo, tree: treeItems,
  });

  let parentSha: string | undefined;
  try {
    const ref = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
    parentSha = ref.data.object.sha;
  } catch (e) {}

  console.log('Creating commit...');
  const commit = await octokit.rest.git.createCommit({
    owner, repo,
    message: 'Save project files from Replit',
    tree: tree.data.sha,
    parents: parentSha ? [parentSha] : [],
  });

  console.log('Updating branch...');
  try {
    await octokit.rest.git.updateRef({
      owner, repo, ref: `heads/${branch}`,
      sha: commit.data.sha, force: true,
    });
  } catch (e) {
    await octokit.rest.git.createRef({
      owner, repo, ref: `refs/heads/${branch}`,
      sha: commit.data.sha,
    });
  }

  console.log(`\nDone! All files saved to: https://github.com/${owner}/${repo}`);
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
