import { llm, logger } from "./shim";
import * as fs from "fs";
import * as path from "path";

// 提示用户安装 PDF 解析依赖：bun add pdf-parse
const PDF_PARSE_DEP = "pdf-parse";

async function checkDependencies() {
  try {
    await import(PDF_PARSE_DEP);
  } catch {
    logger.warn(`检测到未安装 pdf-parse。请先在项目根目录下执行以下命令安装依赖：`);
    console.log(`\n    \x1b[36mbun add pdf-parse @types/pdf-parse\x1b[0m\n`);
    throw new Error("Missing dependencies");
  }
}

// 核心翻译 Prompts 汇集
const TRANSLATION_SYSTEM_PROMPT = `你是一位中文学术翻译专家，精通人工智能、计算机科学、物理学、天体物理学、科技、医学和工程领域的高质量文献翻译。
请将输入的英文学术文本翻译成流畅、专业、符合中文学术规范的中文。

翻译要求：
1. 术语准确性：采用行业公认的名词（如二分图匹配、偏序集、佐恩引理等），在专有名词首次出现时，在括号内加注英文原文（如：佐恩引理（Zorn's Lemma）），后续再次出现时则直接使用中文。
2. 保留 LaTeX 公式：所有的数学/物理公式统一排版为标准 LaTeX 格式（行内公式包裹在单个 $ 中，块级公式包裹在双 $$ 中）。如遇到 OCR 字符残损或乱码，须结合上下文进行推导还原为正确公式。
3. 严格还原格式：严格保留 Markdown 表格结构、列表层级、插图 Figure 说明和引用格式（如 [1] 或 (Sun et al., 2022)）。
4. 参考文献汉化：对参考文献（References）中的 Paper Title 进行翻译并用中括号 [...] 追加在原英文标题之后；作者名、期刊缩写、卷号、年份和 DOI 链接一律保持原样英文。
5. 纯净译文输出：只输出翻译后的中文学术内容，不要包含任何“好的，下面是翻译：”或过渡性状态语。`;

interface PdfText {
  text: string;
  numpages: number;
}

// 核心主程序
async function main() {
  await checkDependencies();
  const pdfParse = (await import(PDF_PARSE_DEP)).default;

  const pdfDir = path.resolve(process.cwd(), "doctor", "pdf");
  const outputDir = path.resolve(pdfDir, "docs-zh");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    logger.info(`创建输出目录: ${outputDir}`);
  }

  // 扫描源文件目录
  const files = fs
    .readdirSync(pdfDir)
    .filter((f) => f.endsWith(".pdf"))
    .sort();

  logger.info(`在目录下扫描到 ${files.length} 个 PDF 文件。准备开始批量处理。`);

  for (const filename of files) {
    const filePath = path.join(pdfDir, filename);
    logger.info(`正在读取并解析: ${filename}...`);

    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = (await pdfParse(dataBuffer)) as PdfText;
      const fullText = pdfData.text;

      logger.info(`成功提取文本。总页数: ${pdfData.numpages}。正在分析主标题...`);

      // 提取主标题：使用 LLM 分析第一页的文本前 1000 字符来确定翻译后的中文主标题
      const firstPageChunk = fullText.slice(0, 2000);
      const titleResponse = await llm.invoke([
        {
          role: "system",
          content:
            "你是一个学术文件分析助理。请从下面给出的学术论文前部文本中，提取出这篇论文的真实完整英文主标题（Main Title），并将其翻译成精准、符合中文学术习惯的中文主标题。只需输出中文翻译主标题本身，绝不要输出任何其他多余的字、标点或解释。",
        },
        {
          role: "user",
          content: firstPageChunk,
        },
      ]);

      let translatedTitle = (titleResponse.content as string).trim();
      // 过滤 Windows 文件名非法字符
      translatedTitle = translatedTitle
        .replace(/[:*?"<>|\\/]/g, "——")
        .replace(/\n/g, "")
        .trim();

      let targetFilename = `${translatedTitle}.md`;
      if (!translatedTitle || translatedTitle.length < 3) {
        const baseName = path.basename(filename, ".pdf");
        targetFilename = `${baseName}_zh.md`;
        logger.warn(`未能识别出有效主标题，回退使用源文件名: ${targetFilename}`);
      } else {
        logger.info(`成功获取译后主标题: ${translatedTitle}`);
      }

      const outputPath = path.join(outputDir, targetFilename);
      if (fs.existsSync(outputPath)) {
        logger.info(`目标翻译文件已存在，跳过: ${targetFilename}`);
        continue;
      }

      logger.info(`准备调用 LLM 进行全文翻译...`);

      // 视文件大小分段翻译以防止超出上下文 Token 限制 (按每 3500 字符切割段落)
      const chunks: string[] = [];
      let currentChunk = "";
      const paragraphs = fullText.split(/\n\n+/);

      for (const para of paragraphs) {
        if (currentChunk.length + para.length > 3500) {
          chunks.push(currentChunk);
          currentChunk = para;
        } else {
          currentChunk += "\n\n" + para;
        }
      }
      if (currentChunk.trim()) {
        chunks.push(currentChunk);
      }

      logger.info(`全文共切割为 ${chunks.length} 个翻译分段，正在依次翻译并追加...`);

      // 依次翻译每个段落块并实时写入文件
      fs.writeFileSync(outputPath, `# ${translatedTitle}\n\n`, "utf-8");

      for (let i = 0; i < chunks.length; i++) {
        logger.info(`正在翻译分段 [${i + 1}/${chunks.length}]...`);
        const chunkResponse = await llm.invoke([
          {
            role: "system",
            content: TRANSLATION_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: chunks[i],
          },
        ]);

        fs.appendFileSync(outputPath, chunkResponse.content + "\n\n", "utf-8");
      }

      logger.info(`翻译成功！结果已写入: ${outputPath}`);
      console.log(`\x1b[32m[SUCCESS] ${filename} -> ${targetFilename}\x1b[0m\n`);
    } catch (err: any) {
      logger.error(`处理文件 ${filename} 失败:`, err.message || err);
    }
  }

  logger.info("所有文献批量翻译任务已执行完毕。");
}

main().catch((err) => {
  logger.error("程序异常退出:", err);
  process.exit(1);
});
