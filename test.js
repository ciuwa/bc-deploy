import { getCurrentVersion, gitCommit, updateVersion } from "./index.js";

updateVersion() // 更新package版本 +1

console.log(getCurrentVersion()) // 获取版本

gitCommit({
  message: 'add index.d.ts',
}) // 提交到 git 

