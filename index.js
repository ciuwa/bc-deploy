
import ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { execSync } from 'child_process';

export async function uploadToFTP(config, localPath, remotePath) {
  const client = new ftp.Client()
  client.ftp.verbose = true

  try {
    await client.access(config)

    if (!fs.existsSync(localPath)) {
      throw new Error(`Local path not found: ${localPath}`)
    }

    await client.ensureDir(remotePath)
    await client.uploadFromDir(localPath)
    console.log('Upload completed successfully')
  } catch (err) {
    console.error('Upload failed:', err)
    throw err
  } finally {
    client.close()
  }
}

export function updateVersion() {
  const packagePath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const currentVersion = packageJson.version.split('.').map(Number);
  currentVersion[2] += 1;
  packageJson.version = currentVersion.join('.');
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log(`Version updated to ${packageJson.version}`);
  return packageJson.version
}

export function getCurrentVersion() {
  const packagePath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

/**
 * 执行Git提交、打标签及推送的增强函数
 * @param {Object} options - 配置项
 * @param {string} [options.branch='main'] - 目标分支名
 * @param {string} [options.commitPrefix='其它: Auto-commit'] - 提交信息前缀
 * @param {boolean} [options.skipTag=false] - 是否跳过打标签
 * @param {Function} [options.onError] - 自定义错误处理器
 */
export function gitCommit(options = {}) {
  const {
    branch = 'main',
    commitPrefix = '其它: Auto-commit',
    skipTag = false,
    onError = (err) => console.error('Git操作失败:', err.message)
  } = options;

  try {
    // 1. 添加所有文件
    execSync('git add .', { stdio: 'inherit' });

    // 2. 生成提交信息（支持自定义时间格式）
    const timestamp = new Date().toISOString();
    const commitMessage = `${commitPrefix}: build on ${timestamp}`;
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

    // 3. 打标签（可选）
    if (!skipTag) {
      const newVersion = getCurrentVersion();
      execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { stdio: 'inherit' });
      execSync(`git push origin v${newVersion}`, { stdio: 'inherit' });
      console.log(`Created tag v${newVersion}`);
    }

    // 4. 推送代码
    execSync(`git push origin ${branch}`, { stdio: 'inherit' });
    console.log(`Pushed to ${branch}`);

  } catch (error) {
    onError(error);
  }
}

export function moveFiles(sourceDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const items = fs.readdirSync(sourceDir);

  items.forEach(item => {
    const sourcePath = path.join(sourceDir, item);
    const targetPath = path.join(targetDir, item);

    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      // 如果是目录，递归处理
      moveFiles(sourcePath, targetPath);

      // 移动完子目录内容后，删除空目录
      try {
        fs.rmdirSync(sourcePath);
        // console.log(`目录 ${sourcePath} 已删除`);
      } catch (err) {
        console.error(`无法删除目录 ${sourcePath}:`, err);
      }
    } else {
      // 如果是文件，直接移动
      try {
        fs.renameSync(sourcePath, targetPath);
        // console.log(`文件 ${sourcePath} 已移动到 ${targetPath}`);
      } catch (err) {
        console.error(`无法移动文件 ${sourcePath} 到 ${targetPath}:`, err);
      }
    }
  });
}


export function copyDirectory(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`源目录不存在: ${sourceDir}`);
  }

  // 创建目标目录
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const items = fs.readdirSync(sourceDir);

  items.forEach(item => {
    const sourcePath = path.join(sourceDir, item);
    const targetPath = path.join(targetDir, item);

    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      // 递归复制子目录
      copyDirectory(sourcePath, targetPath);
    } else {
      // 复制文件
      try {
        fs.copyFileSync(sourcePath, targetPath);
      } catch (err) {
        console.error(`无法复制文件 ${sourcePath} 到 ${targetPath}:`, err);
      }
    }
  });
}