// 中英对照标签系统。所有页面共用。

// ---------- 写作 ----------

export const WRITING_DIMENSIONS = {
  tr: { short: 'TR', cn: '审题' },
  cc: { short: 'CC', cn: '连贯' },
  lr: { short: 'LR', cn: '词汇' },
  ga: { short: 'GA', cn: '语法' },
};

export const WRITING_DIMENSION_FULL = {
  tr: 'Task Response',
  cc: 'Coherence & Cohesion',
  lr: 'Lexical Resource',
  ga: 'Grammar & Accuracy',
};

export const WRITING_ERROR_LABELS = {
  prep_collocation: '介词搭配',
  tense_shift: '时态乱跳',
  weak_argument: '论证弱',
  article_misuse: '冠词错',
  word_form: '词性错',
  incomplete_answer: '答题不完整',
  subj_verb_agree: '主谓不一致',
  linker_overuse: '连接词过度',
  basic_vocabulary: '词汇基础',
  conditional: '条件句错',
  copy_question: '抄题目',
  informal_register: '口语化',
  passive_overuse: '被动语态过度',
  run_on: '流水句',
  paragraph_structure: '段落结构',
};

export const WRITING_ERROR_TYPES = {
  grammar: '语法',
  lexical: '词汇',
  cohesion: '衔接',
  task_response: '切题',
  coherence: '连贯',
};

// ---------- 阅读 ----------

export const READING_QUESTION_TYPES = {
  tfng: 'TFNG 判断',
  ynng: 'YNNG 观点',
  matching_headings: '标题匹配',
  matching_info: '信息匹配',
  matching_features: '特征匹配',
  mcq: '多选题',
  summary: '摘要填空',
  sentence_completion: '句子填空',
  short_answer: '简答题',
  heading: '标题题',
  table: '表格题',
  flow_chart: '流程图',
};

export const READING_ERROR_LABELS = {
  tfng_inference: 'TFNG做推理',
  tfng_partial_match: 'TFNG部分匹配',
  tfng_overgeneralization: 'TFNG绝对词',
  tfng_degree_shift: 'TFNG程度词',
  tfng_wrong_cause: 'TFNG因果错',
  tfng_missing_specifier: 'TFNG限定词',
  matching_paraphrase: '没认同义替换',
  matching_distractor: '匹配干扰项',
  mcq_distractor: '多选干扰项',
  summary_word_limit: '超字数',
  time_pressure: '时间不够',
  definition_too_narrow: '定义太窄',
};

// ---------- 听力 ----------

export const LISTENING_ERROR_LABELS = {
  spelling: '拼写',
  number: '数字',
  map: '地图方位',
  distractor_trap: '干扰项骗',
  paraphrase: '同义替换',
  over_word_limit: '超字数',
  singular_plural: '单复数',
  missed_negation: '漏听否定',
  accent: '口音',
};

export const LISTENING_SECTION_TYPES = {
  form_completion: '表格填空',
  note_completion: '笔记填空',
  summary_completion: '摘要填空',
  sentence_completion: '句子填空',
  mcq: '多选题',
  matching: '匹配题',
  map: '地图',
  plan: '平面图',
  diagram: '示意图',
  short_answer: '简答',
  table: '表格',
};

// ---------- 分数 ----------

export const SCORE_TYPES = {
  mock: '模考',
  real: '真考',
  partial: '部分',
  diagnose: '诊断',
};

export const SUBJECT_NAMES = {
  l: '听力',
  r: '阅读',
  w: '写作',
  s: '口语',
  overall: '总分',
};

// ---------- 口语 ----------

export const STORY_STATUS = {
  drafted: '初稿',
  rehearsed: '已彩排',
  recorded: '已录音',
};

export const SPEAKING_GROUP_NAMES = {
  people: '人物',
  places: '地点',
  things: '物品',
  events: '事件',
  experiences: '经历',
  media: '媒体',
};

// ---------- 辅助函数 ----------

/**
 * 生成「英文 (中文)」格式的标签。如果找不到翻译，只返回英文。
 * 例: labelCN(WRITING_ERROR_LABELS, 'prep_collocation') → 'prep_collocation (介词搭配)'
 */
export function labelCN(map, key) {
  const cn = map?.[key];
  return cn ? `${key} (${cn})` : key;
}

/** 只返回中文，找不到就返回英文 */
export function cnOnly(map, key) {
  return map?.[key] || key;
}

/** 「中文 (英文)」格式，把中文放前面 */
export function cnFirst(map, key) {
  const cn = map?.[key];
  return cn ? `${cn} (${key})` : key;
}
