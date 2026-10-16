/**
 * Language Pack Diff Checker Script
 *
 * Purpose:
 *   Compare src/lang/locale/en.ts with every other locale file in that folder
 *   (e.g. zh-cn.ts) and report the keys each one is missing or has in excess.
 *   Output is color-coded per file:
 *     - Green: Key exists in en.ts but missing in the other language file
 *     - Red:   Key exists in the other language file but not in en.ts
 *     - Yellow: The same key exists in both files but the line numbers are different
 *
 * Dependencies:
 *   Node.js environment, no extra dependencies required.
 *
 * Usage:
 *   Open a terminal in the project root and run:
 *     node src/lang/langDiffWithEn.js
 *
 *   The script compares every locale file it finds next to en.ts, so there is no
 *   file name argument: nothing from the command line ever becomes a file path.
 *
 * Output:
 *   + (green): Key exists in en.ts but missing in the language file
 *   - (red):   Key exists in the language file but not in en.ts
 *   ! (yellow): The same key exists in both files but the line numbers are different
 *   A file with no output has identical keys to en.ts.
 */
/**
 * 语言包差异检测脚本
 *
 * 用途：
 *   逐个比较 src/lang/locale/en.ts 与同目录下其它语言文件（如 zh-cn.ts）中的 key，
 *   输出每个文件缺失和多余的 key。输出内容会用不同颜色区分：
 *     - 绿色：en.ts 有但目标语言缺失的 key
 *     - 红色：目标语言有但 en.ts 没有的 key
 *     - 黄色：相同的 key 所在的行号不相同
 *
 * 依赖：
 *   Node.js 环境，无需额外依赖。
 *
 * 用法：
 *   在项目根目录执行：
 *     node src/lang/langDiffWithEn.js
 *
 *   脚本会比较 locale 目录中实际存在的所有语言文件，因此不接受文件名参数：
 *   命令行输入不会参与文件路径的构造。
 *
 * 输出说明：
 *   + 开头（绿色）：en.ts 有但目标语言缺失的 key
 *   - 开头（红色）：目标语言有但 en.ts 没有的 key
 *   ! 开头（黄色）：相同的 key 所在的行号不相同
 *   某个语言文件没有输出则表示它与 en.ts 的 key 完全一致。
 */

const fs = require("fs");
const path = require("path");

/** locale 目录与基准语言文件：两个路径都只由本文件的位置决定。 */
const LOCALE_DIR = path.join(__dirname, "./locale");
const REFERENCE_LOCALE = "en.ts";

/**
 * 解析一个语言文件，提取每个 key 所在的行号。
 *
 * @param {string} localeFileName locale 目录中的文件名，如 en.ts（来自目录枚举）
 * @returns {Record<string, number>} key 到行号的映射
 */
function parseLocaleFile(localeFileName) {
  // 读取文件内容并按行分割
  const lines = fs
    .readFileSync(path.join(LOCALE_DIR, localeFileName), "utf8")
    .split(/\r?\n/);
  const result = {};
  let inExport = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 检查是否进入 export default 块
    if (!inExport && line.includes("export default")) {
      inExport = true;
      continue;
    }
    if (!inExport) {
      continue;
    }
    // 匹配 key: "value", 格式的行
    const m = line.match(/^\s*([A-Z0-9_]+)\s*:\s*.*?,?$/);
    if (m) {
      let key = m[1];
      // 保存 key 及其所在行号
      result[key] = i + 1;
    }
  }
  return result;
}

/**
 * 读取 locale 目录下的所有语言文件。
 *
 * 文件名来自目录枚举，因此没有任何外部输入会进入文件路径。
 *
 * @returns {Map<string, Record<string, number>>} 文件名到 key 行号表的映射
 */
function readLocaleFiles() {
  const files = new Map();
  for (const entry of fs.readdirSync(LOCALE_DIR)) {
    if (!entry.endsWith(".ts")) {
      continue;
    }
    files.set(entry, parseLocaleFile(entry));
  }
  return files;
}

/**
 * 比较 en 与其它语言文件的 key/value。
 *
 * @param {Record<string, number>} en en.ts 的 key 行号表
 * @param {Record<string, number>} target 目标语言文件的 key 行号表
 * @returns {string[]} 差异描述行
 */
function diffWithReference(en, target) {
  const allKeys = new Set([...Object.keys(en), ...Object.keys(target)]);
  const diffs = [];
  for (const key of allKeys) {
    if (!(key in en)) {
      diffs.push(`- ${key}: ${target[key]}`);
    } else if (!(key in target)) {
      diffs.push(`+ ${key}: ${en[key]}`);
    } else if (en[key] !== target[key]) {
      diffs.push(`! ${key}: en: ${en[key]} <--> lang: ${target[key]}`);
    }
  }
  return diffs;
}

/**
 * 比较 en.ts 与 locale 目录中的其它语言文件。
 *
 * @returns {{ locale: string, diffs: string[] }[]} 每个语言文件及其差异
 */
function diffLang() {
  const localeFiles = readLocaleFiles();
  const en = localeFiles.get(REFERENCE_LOCALE) ?? {};
  const results = [];
  for (const [locale, keys] of localeFiles) {
    if (locale === REFERENCE_LOCALE) {
      continue;
    }
    results.push({ locale, diffs: diffWithReference(en, keys) });
  }
  return results;
}

// CLI
if (require.main === module) {
  const results = diffLang();
  if (results.length === 0) {
    console.log("locale 目录中只有 en.ts，没有可比较的语言文件");
  }
  for (const { locale, diffs } of results) {
    if (diffs.length === 0) {
      console.log(`语言文件 ${locale} 与 en.ts 无差异`);
      continue;
    }
    console.log(`--- ${locale} ---`);
    diffs.forEach((line) => {
      if (line.startsWith("+")) {
        // 绿色
        console.log("\x1b[32m%s\x1b[0m", line);
      } else if (line.startsWith("-")) {
        // 红色
        console.log("\x1b[31m%s\x1b[0m", line);
      } else if (line.startsWith("!")) {
        // 黄色
        console.log("\x1b[33m%s\x1b[0m", line);
      } else {
        // 默认
        console.log(line);
      }
    });
  }
}
