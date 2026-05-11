import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "雅思听力TXT整理");
const setDir = path.join(outDir, "01_按套题_一套一个txt");
const partDir = path.join(outDir, "02_按Part分类_5套一个txt");

const officialNotes = [
  "本素材包不复制剑桥真题、近期机经原题、听力原文或答案全文。",
  "用途：把正版材料/公开考题索引整理成可生成语音的练习 TXT。",
  "如果你手里有正版题目或自己的错题，可以把原文/答案粘到对应文件的【正版材料填入区】。",
  "语音生成建议：每个 Part 单独生成音频；Part 1 慢速清晰，Part 3/4 使用自然语速。",
];

const partDefaults = {
  1: {
    scene: "日常双人对话：报名、预订、咨询、表格信息",
    qtype: "Form / Note completion",
    focus: "姓名、电话、日期、地址、价格、拼写、单复数",
  },
  2: {
    scene: "日常独白：场馆介绍、活动安排、地图/路线",
    qtype: "Multiple choice / Matching / Map",
    focus: "方位词、地点功能、流程顺序、干扰信息",
  },
  3: {
    scene: "学术多人讨论：课程、作业、研究项目、导师反馈",
    qtype: "Multiple choice / Matching",
    focus: "观点归属、态度变化、同义替换、选项干扰",
  },
  4: {
    scene: "学术讲座独白：自然科学、人文社科、技术与环境",
    qtype: "Note / Summary completion",
    focus: "名词短语、因果关系、定义、分类、拼写准确度",
  },
};

const recent = [
  ["2026-04-11", "Magazine", "Fill in the blank", "Project Introduction / Map", "Multiple-choice", "Academic Discussion", "Multiple-Choice", "Photic Sneezing", "Fill in the blank"],
  ["2026-03-28", "Insurance Form", "Fill in the blank", "Team Activity", "Multiple-choice", "Battery-powered motorbikes", "Multiple Choice", "Aegean Wall Lizard", "Fill in the blank"],
  ["2026-03-21", "Activities in Queensland", "Fill in the blank", "Map", "Multiple-choice, Matching", "Action Research & New Teaching Methods", "Fill in the blank", "Effect of the Digital World on Young People", "Multiple Choice, Matching"],
  ["2026-02-28", "Art Course Registration", "Fill in the blank", "Hotel Afternoon Tea", "Matching, Multiple-choice", "Business Cooperation", "Matching, Multiple-choice", "The Saiga Antelope", "Fill in the blanks"],
  ["2026-01-31", "Hotel Anniversary Celebration", "Fill in the blank", "New Project", "Matching, Multiple-choice", "Academic Discussion", "Matching, Multiple-choice", "How Surtsey was formed", "Fill in the blanks"],
  ["2026-01-24", "Hotel Booking", "Fill in the blank", "Skydiving Precautions", "Multiple-choice, Matching", "Antarctic Expedition", "Multiple-choice", "Vancouver Island Marmots", "Fill in the blanks"],
  ["2026-01-10", "Health center", "Fill in the blank", "Website make-over service", "Multiple-choice, Matching", "Factory internship", "Multiple-choice, Matching", "A new type of agriculture", "Fill in the blanks"],
  ["2025-12-20", "Postal Redelivery Form", "Fill in the blank", "White Night Festival", "Multiple-choice, Matching", "Marron Farm", "Multiple-choice, Matching", "Wildlife Evolution in Cities", "Fill in the blanks"],
  ["2025-12-13", "Adult Learning Group", "Fill in the blank", "Park activities", "Multiple-choice, Matching", "Bones and our origins", "Multiple-choice, Matching", "Echinacea in New Zealand", "Fill in the blanks"],
  ["2025-12-06", "Upper Providence Folk Festival", "Fill in the blank", "About a Trip", "Multiple-choice, Matching", "e-waste", "Multiple-choice", "19th Century British Photographers Exhibition", "Fill in the blanks"],
  ["2025-11-22", "City tours", "Fill in the blank", "Swimming competition map", "Multiple-choice, Matching", "Visit to Glendale School", "Multiple-choice, Matching", "Adwaita Turtles", "Fill in the blanks"],
  ["2025-11-15", "Weekend Cycling", "Fill in the blank", "Swimming competition", "Multiple-choice, Matching", "Academic Discussion", "Multiple-choice, Matching", "Honeyguide Bird", "Fill in the blanks"],
  ["2025-11-01", "Travel Insurance", "Fill in the blank", "Hospital Renovation", "Multiple-choice, Matching", "Absent from work", "Single Choice, Matching", "The Development of Maori Art and Design", "Fill in the blanks"],
  ["2025-10-25", "Swimming Courses", "Fill in the blank", "Trees", "Multiple-choice, Matching", "Work placement", "Multiple-choice, Matching", "Nazca Lines", "Fill in the blanks"],
  ["2025-10-18", "Resident Feedback on Bus Route Modifications", "Fill in the blank", "Southwell Camp Map", "Multiple-choice, Matching", "Ancient Painting Authentication", "Multiple-choice, Matching", "Dolphin Intelligence", "Fill in the blanks"],
  ["2025-10-11", "Ship Hotel Reservation", "Fill in the blank", "National Zoo", "Multiple-choice, Matching", "Not Sure", "Not Sure", "Recalling", "Fill in the blanks"],
  ["2025-09-27", "Customer Order Form", "Fill in the blank", "Youth Football Championship Map", "Multiple-choice, Matching", "Recycling Project", "Multiple-choice, Matching", "Heat Pumps in the UK", "Fill in the blanks"],
  ["2025-09-13", "Concert Ticket Booking", "Fill in the blank", "Casino Map", "Multiple-choice, Matching", "Discussing Coral Reefs", "Multiple-choice", "Peruvian Tern", "Fill in the blanks"],
  ["2025-08-30", "Rental Consultation", "Fill in the blank", "Children's Activities", "Multiple-choice, Matching", "Student Bicycle Center", "Multiple-choice", "Charcoal", "Fill in the blanks"],
  ["2025-08-23", "Marketing Conference", "Fill in the blank", "Island Trip", "Multiple-choice, Matching", "Farmers and Agriculture", "Multiple-choice", "Declining Computing Ability", "Fill in the blanks"],
].map(([date, p1, t1, p2, t2, p3, t3, p4, t4]) => ({
  id: `Recent-${date}`,
  title: `近期考题 ${date}`,
  source: "ExamWord IELTS 2026 Listening Questions recent-question index",
  parts: [
    { part: 1, scene: p1, qtype: t1 },
    { part: 2, scene: p2, qtype: t2 },
    { part: 3, scene: p3, qtype: t3 },
    { part: 4, scene: p4, qtype: t4 },
  ],
}));

const cambridge = [];
for (let book = 12; book <= 19; book++) {
  for (let test = 1; test <= 4; test++) {
    cambridge.push({
      id: `Cambridge-${book}-Test-${test}`,
      title: `剑桥 IELTS ${book} Test ${test}`,
      source: `Cambridge IELTS ${book} 正版书/音频 Test ${test}`,
      parts: [1, 2, 3, 4].map((partNo) => ({ part: partNo, ...partDefaults[partNo] })),
    });
  }
}

const allSets = [...cambridge, ...recent];

function slugName(s) {
  return s.replaceAll(" ", "-").replaceAll(":", "").replaceAll("/", "-");
}

function partBlock(set, p) {
  const d = partDefaults[p.part];
  return [
    `## Part ${p.part}`,
    `来源：${set.source}`,
    `场景/主题：${p.scene}`,
    `题型：${p.qtype}`,
    `训练重点：${p.focus || d.focus}`,
    "",
    "【正版材料填入区】",
    "题目摘要：",
    "答案/关键词：",
    "错题点：",
    "",
    "【TTS 语音练习脚本】",
    `Now listen to Part ${p.part}. The topic is ${p.scene}.`,
    `Before listening, predict the answer type for each blank or option. Pay attention to ${p.focus || d.focus}.`,
    "Question 1. Write the key word you hear. Pause for three seconds.",
    "Question 2. Listen for the corrected information after the speaker changes their mind.",
    "Question 3. Notice the paraphrase, not only the exact word in the question.",
    "Question 4. Check spelling, singular or plural, and word limit.",
    "End of this part. Replay once, then shadow the answer sentence aloud.",
    "",
    "【生成音频建议】",
    `文件名建议：${set.id}_Part${p.part}.mp3`,
    "朗读设置：自然英语；Part 1 可稍慢，Part 3/4 接近考试速度。",
  ].join("\n");
}

function setFile(set) {
  return [
    `# ${set.title}`,
    "",
    ...officialNotes.map((x) => `- ${x}`),
    "",
    "本文件结构：Part 1-4 每个部分都可单独生成语音。",
    "",
    ...set.parts.map((p) => partBlock(set, p)),
  ].join("\n\n");
}

function partGroupedFile(chunk, index) {
  const range = `${chunk[0].id} 到 ${chunk[chunk.length - 1].id}`;
  const lines = [
    `# Part 分类练习 第 ${String(index).padStart(2, "0")} 组`,
    `范围：${range}`,
    "每组约 5 套题，适合一次生成一批音频或按 Part 做专项训练。",
    "",
    ...officialNotes.map((x) => `- ${x}`),
    "",
  ];

  for (let partNo = 1; partNo <= 4; partNo++) {
    lines.push(`\n# Part ${partNo} 专项`);
    for (const set of chunk) {
      const p = set.parts.find((item) => item.part === partNo);
      lines.push("");
      lines.push(`## ${set.title}`);
      lines.push(`来源：${set.source}`);
      lines.push(`场景/主题：${p.scene}`);
      lines.push(`题型：${p.qtype}`);
      lines.push(`训练重点：${p.focus || partDefaults[partNo].focus}`);
      lines.push("TTS 提示：先读题型和场景，再读 4 条练习指令；最后留 5 秒检查拼写。");
    }
  }
  return lines.join("\n");
}

await rm(outDir, { recursive: true, force: true });
await mkdir(setDir, { recursive: true });
await mkdir(partDir, { recursive: true });

for (const set of allSets) {
  await writeFile(path.join(setDir, `${slugName(set.id)}.txt`), setFile(set), "utf8");
}

let groupIndex = 1;
for (let i = 0; i < allSets.length; i += 5) {
  const chunk = allSets.slice(i, i + 5);
  await writeFile(
    path.join(partDir, `Part分类_${String(groupIndex).padStart(2, "0")}_${slugName(chunk[0].id)}__${slugName(chunk[chunk.length - 1].id)}.txt`),
    partGroupedFile(chunk, groupIndex),
    "utf8",
  );
  groupIndex++;
}

await writeFile(
  path.join(outDir, "README_使用说明与版权边界.txt"),
  [
    "# 雅思听力 TXT 整理包",
    "",
    "你要的两个版本已经生成：",
    "1. 01_按套题_一套一个txt：每套题一个 TXT，包括剑桥 12-19 共 32 套，以及近期考题索引 20 套。",
    "2. 02_按Part分类_5套一个txt：每 5 套合并成一个 TXT，并按 Part 1-4 分类。",
    "",
    "重要说明：",
    ...officialNotes.map((x) => `- ${x}`),
    "",
    "近期考题来源：ExamWord IELTS 2026 Listening Questions 页面公开索引，整理到 2026-04-11 为止；当前日期是 2026-05-08。",
    "官方格式参考：IELTS Listening 一共 4 个部分，每部分 10 题；Part 1/2 是日常社交场景，Part 3/4 是教育/学术场景。",
    "",
    "推荐使用方式：",
    "- 先打开套题版，把你手里的正版剑桥题目/答案填进【正版材料填入区】。",
    "- 再把 TTS 语音练习脚本复制给语音生成工具，按 Part 生成 MP3。",
    "- 如果只想专项练 Part 3 或 Part 4，打开 Part 分类版，连续生成 5 套同一 Part 的音频。",
  ].join("\n"),
  "utf8",
);

await writeFile(
  path.join(outDir, "sources.txt"),
  [
    "Sources used:",
    "1. IELTS official Listening format: https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening",
    "2. British Council test format: https://takeielts.britishcouncil.org/take-ielts/test-format",
    "3. Recent listening topic index: https://www.examword.com/ielts-practice/listening-exam-question",
    "",
    "Copyright note:",
    "This folder contains study organization, metadata, and original practice prompts only. It intentionally does not reproduce full Cambridge IELTS questions, transcripts, answer keys, or unofficial leaked exam content.",
  ].join("\n"),
  "utf8",
);

console.log(`Generated ${allSets.length} set files and ${Math.ceil(allSets.length / 5)} part-group files in ${outDir}`);
