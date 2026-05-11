import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { PATHS, exists } from './paths.js';
import {
  profileSchema,
  scoresSchema,
  writingSubmissionSchema,
  readingSubmissionSchema,
  listeningSubmissionSchema,
  vocabDaySchema,
  storySchema,
  topicGroupsSchema,
  safeParse,
} from './schema.js';

const issues = [];

function pushIssue(file, error) {
  issues.push({ file: path.relative(PATHS.root, file), error });
}

function clearIssues() {
  issues.length = 0;
}

function getIssues() {
  return [...issues];
}

function readFm(file) {
  if (!exists(file)) return null;
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = matter(raw);
    return parsed.data;
  } catch (e) {
    pushIssue(file, `parse error: ${e.message}`);
    return null;
  }
}

function readYaml(file) {
  if (!exists(file)) return null;
  try {
    return yaml.load(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    pushIssue(file, `yaml parse error: ${e.message}`);
    return null;
  }
}

function listFiles(dir, ext) {
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .map((f) => path.join(dir, f))
    .sort();
}

function validate(schema, data, file) {
  const r = safeParse(schema, data, file);
  if (!r.ok) {
    pushIssue(file, r.issues.map((i) => `${i.path}: ${i.message}`).join('; '));
    return null;
  }
  return r.data;
}

// ---------- profile ----------

export function loadProfile() {
  const fm = readFm(PATHS.profile);
  if (!fm) return null;
  return validate(profileSchema, fm, PATHS.profile);
}

// ---------- scores ----------

export function loadScores() {
  const fm = readFm(PATHS.scores);
  if (!fm) return { records: [] };
  const r = validate(scoresSchema, fm, PATHS.scores);
  return r || { records: [] };
}

// ---------- writing ----------

export function loadWriting() {
  const files = listFiles(PATHS.writing.submissions, '.md');
  const submissions = [];
  for (const f of files) {
    const fm = readFm(f);
    if (!fm) continue;
    const v = validate(writingSubmissionSchema, fm, f);
    if (v) submissions.push({ ...v, file: path.basename(f) });
  }
  submissions.sort((a, b) => a.date.localeCompare(b.date));

  const errorAgg = {};
  for (const s of submissions) {
    for (const e of s.errors) {
      const key = `${e.type}:${e.tag}`;
      errorAgg[key] = (errorAgg[key] || 0) + e.count;
    }
  }
  const topErrors = Object.entries(errorAgg)
    .map(([key, count]) => {
      const [type, tag] = key.split(':');
      return { type, tag, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return { submissions, top_errors: topErrors, count: submissions.length };
}

// ---------- reading ----------

export function loadReading() {
  const files = listFiles(PATHS.reading.submissions, '.md');
  const submissions = [];
  for (const f of files) {
    const fm = readFm(f);
    if (!fm) continue;
    const v = validate(readingSubmissionSchema, fm, f);
    if (v) submissions.push({ ...v, file: path.basename(f) });
  }
  submissions.sort((a, b) => a.date.localeCompare(b.date));

  const typeAgg = {};
  for (const s of submissions) {
    for (const qt of s.question_types) {
      if (!typeAgg[qt.type]) typeAgg[qt.type] = { total: 0, correct: 0 };
      typeAgg[qt.type].total += qt.total;
      typeAgg[qt.type].correct += qt.correct;
    }
  }
  const typeDistribution = Object.entries(typeAgg)
    .map(([type, v]) => ({
      type,
      total: v.total,
      correct: v.correct,
      accuracy: v.total ? +(v.correct / v.total).toFixed(3) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const errorAgg = {};
  for (const s of submissions) {
    for (const e of s.errors) {
      errorAgg[e.tag] = (errorAgg[e.tag] || 0) + 1;
    }
  }
  const topErrors = Object.entries(errorAgg)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    submissions,
    question_type_distribution: typeDistribution,
    top_errors: topErrors,
    count: submissions.length,
  };
}

export function loadSynonyms() {
  const files = listFiles(PATHS.reading.synonyms, '.yaml');
  const all = [];
  for (const f of files) {
    const data = readYaml(f);
    if (!Array.isArray(data)) continue;
    for (const item of data) {
      if (item && item.original && item.paraphrase) {
        all.push({
          original: item.original,
          paraphrase: item.paraphrase,
          source: item.source || path.basename(f, '.yaml'),
          context: item.context || null,
        });
      }
    }
  }
  return { items: all, count: all.length };
}

// ---------- listening ----------

export function loadListening() {
  const files = listFiles(PATHS.listening.submissions, '.md');
  const submissions = [];
  for (const f of files) {
    const fm = readFm(f);
    if (!fm) continue;
    const v = validate(listeningSubmissionSchema, fm, f);
    if (v) submissions.push({ ...v, file: path.basename(f) });
  }
  submissions.sort((a, b) => a.date.localeCompare(b.date));

  const sectionAgg = [0, 0, 0, 0];
  const sectionCount = [0, 0, 0, 0];
  for (const s of submissions) {
    if (Array.isArray(s.section_scores)) {
      for (let i = 0; i < 4; i++) {
        sectionAgg[i] += s.section_scores[i] || 0;
        sectionCount[i] += 1;
      }
    }
  }
  const sectionAvg = sectionAgg.map((sum, i) =>
    sectionCount[i] ? +(sum / sectionCount[i]).toFixed(2) : 0
  );

  const typeAgg = {};
  for (const s of submissions) {
    for (const st of s.section_types || []) {
      if (!typeAgg[st.type]) typeAgg[st.type] = { total: 0, correct: 0 };
      typeAgg[st.type].total += st.total;
      typeAgg[st.type].correct += st.correct;
    }
  }
  const typeDistribution = Object.entries(typeAgg)
    .map(([type, v]) => ({
      type,
      total: v.total,
      correct: v.correct,
      accuracy: v.total ? +(v.correct / v.total).toFixed(3) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const errorAgg = {};
  for (const s of submissions) {
    for (const e of s.error_types || []) {
      errorAgg[e.tag] = (errorAgg[e.tag] || 0) + e.count;
    }
  }
  const topErrors = Object.entries(errorAgg)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    submissions,
    section_avg: sectionAvg,
    type_distribution: typeDistribution,
    top_errors: topErrors,
    count: submissions.length,
  };
}

// ---------- vocab ----------

export function loadVocab() {
  const files = listFiles(PATHS.vocab.days, '.md');
  const days = [];
  for (const f of files) {
    const fm = readFm(f);
    if (!fm) continue;
    const v = validate(vocabDaySchema, fm, f);
    if (v) days.push({ ...v, file: path.basename(f) });
  }
  days.sort((a, b) => a.day - b.day);

  const difficult = readYaml(PATHS.vocab.difficult);
  const mastered = readYaml(PATHS.vocab.mastered);

  const totalPushed = days.reduce((s, d) => s + (d.words_pushed?.length || 0), 0);
  const totalMastered = Array.isArray(mastered) ? mastered.length : 0;
  const totalDifficult = Array.isArray(difficult) ? difficult.length : 0;

  const recentTests = days.filter((d) => d.test).slice(-7);
  const recentAvg =
    recentTests.length > 0
      ? +(
          recentTests.reduce((s, d) => s + d.test.correct / d.test.total, 0) /
          recentTests.length
        ).toFixed(3)
      : null;

  return {
    days,
    difficult: Array.isArray(difficult) ? difficult : [],
    mastered: Array.isArray(mastered) ? mastered : [],
    summary: {
      current_day: days.length ? days[days.length - 1].day : 0,
      total_pushed: totalPushed,
      total_mastered: totalMastered,
      total_difficult: totalDifficult,
      recent_test_accuracy: recentAvg,
    },
  };
}

// ---------- speaking ----------

export function loadSpeaking() {
  const files = listFiles(PATHS.speaking.stories, '.md');
  const stories = [];
  for (const f of files) {
    const fm = readFm(f);
    if (!fm) continue;
    const v = validate(storySchema, fm, f);
    if (v) stories.push({ ...v, file: path.basename(f) });
  }

  const groupsRaw = readYaml(PATHS.speaking.topicGroups);
  let groups = null;
  if (groupsRaw) {
    const r = safeParse(topicGroupsSchema, groupsRaw, PATHS.speaking.topicGroups);
    if (r.ok) groups = r.data;
    else pushIssue(PATHS.speaking.topicGroups, r.issues.map((i) => i.message).join('; '));
  }

  return {
    stories,
    groups,
    count: stories.length,
  };
}

// ---------- timeline ----------

export function loadTimeline() {
  const events = [];
  const writing = loadWriting();
  for (const s of writing.submissions) {
    events.push({ date: s.date, type: 'writing', label: `Task ${s.task} ${s.topic}`, score: s.score.overall });
  }
  const reading = loadReading();
  for (const s of reading.submissions) {
    events.push({ date: s.date, type: 'reading', label: s.source, score: s.band || null, accuracy: s.accuracy });
  }
  const listening = loadListening();
  for (const s of listening.submissions) {
    events.push({ date: s.date, type: 'listening', label: s.source, score: s.band });
  }
  const vocab = loadVocab();
  for (const d of vocab.days) {
    events.push({
      date: d.date,
      type: 'vocab',
      label: `Day ${d.day} (${d.words_pushed?.length || 0} words)`,
      score: d.test ? +(d.test.correct / d.test.total).toFixed(2) : null,
    });
  }
  events.sort((a, b) => a.date.localeCompare(b.date));

  const heatmap = {};
  for (const e of events) {
    heatmap[e.date] = (heatmap[e.date] || 0) + 1;
  }
  return { events, heatmap };
}

// ---------- snapshot (everything) ----------

export function loadSnapshot() {
  clearIssues();
  return {
    profile: loadProfile(),
    scores: loadScores(),
    writing: loadWriting(),
    reading: loadReading(),
    listening: loadListening(),
    vocab: loadVocab(),
    speaking: loadSpeaking(),
    synonyms: loadSynonyms(),
    timeline: loadTimeline(),
    issues: getIssues(),
    generated_at: new Date().toISOString(),
  };
}

export { getIssues, clearIssues };
