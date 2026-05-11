import { z } from 'zod';

const score4 = z.object({
  l: z.number().nullable().optional(),
  r: z.number().nullable().optional(),
  w: z.number().nullable().optional(),
  s: z.number().nullable().optional(),
});

export const profileSchema = z.object({
  goal_band: z.number(),
  exam_date: z.string().nullable().optional(),
  created_at: z.string().optional(),
  current: score4,
  weekly_hours: z.number().optional(),
  focus: z.array(z.string()).optional(),
});

export const scoreRecordSchema = z.object({
  date: z.string(),
  type: z.enum(['mock', 'real', 'partial', 'diagnose']),
  l: z.number().nullable().optional(),
  r: z.number().nullable().optional(),
  w: z.number().nullable().optional(),
  s: z.number().nullable().optional(),
  overall: z.number().nullable().optional(),
  source: z.string().optional(),
});

export const scoresSchema = z.object({
  records: z.array(scoreRecordSchema),
});

export const writingSubmissionSchema = z.object({
  date: z.string(),
  task: z.union([z.literal(1), z.literal(2)]),
  topic: z.string(),
  score: z.object({
    tr: z.number(),
    cc: z.number(),
    lr: z.number(),
    ga: z.number(),
    overall: z.number(),
  }),
  errors: z.array(z.object({
    type: z.string(),
    tag: z.string(),
    count: z.number(),
  })).default([]),
  duration_min: z.number().optional(),
  word_count: z.number().optional(),
});

export const readingSubmissionSchema = z.object({
  date: z.string(),
  source: z.string(),
  total: z.number(),
  correct: z.number(),
  accuracy: z.number(),
  band: z.number().optional(),
  question_types: z.array(z.object({
    type: z.string(),
    total: z.number(),
    correct: z.number(),
  })).default([]),
  errors: z.array(z.object({
    tag: z.string(),
    question: z.union([z.number(), z.string()]).optional(),
    type: z.string().optional(),
  })).default([]),
  synonyms_added: z.number().optional(),
  duration_min: z.number().optional(),
});

export const listeningSubmissionSchema = z.object({
  date: z.string(),
  source: z.string(),
  total: z.number(),
  correct: z.number(),
  band: z.number(),
  section_scores: z.array(z.number()).length(4).optional(),
  section_types: z.array(z.object({
    section: z.number(),
    type: z.string(),
    total: z.number(),
    correct: z.number(),
  })).default([]),
  error_types: z.array(z.object({
    tag: z.string(),
    count: z.number(),
    examples: z.array(z.string()).optional(),
  })).default([]),
  duration_min: z.number().optional(),
});

export const vocabDaySchema = z.object({
  day: z.number(),
  date: z.string(),
  words_pushed: z.array(z.string()).default([]),
  test: z.object({
    total: z.number(),
    correct: z.number(),
    wrong: z.array(z.string()).default([]),
  }).nullable().optional(),
  mastered_today: z.array(z.string()).default([]),
  difficult_added: z.array(z.string()).default([]),
  review_due: z.array(z.object({
    from_day: z.number(),
    count: z.number(),
  })).default([]),
  duration_min: z.number().optional(),
});

export const storySchema = z.object({
  id: z.number(),
  topic_primary: z.string(),
  topics_covered: z.array(z.string()).default([]),
  parts: z.array(z.number()).default([2]),
  length_sec: z.number().optional(),
  status: z.enum(['drafted', 'rehearsed', 'recorded']).default('drafted'),
  created_at: z.string().optional(),
});

export const topicGroupsSchema = z.object({
  groups: z.array(z.object({
    name: z.string(),
    topics: z.array(z.string()),
    stories: z.array(z.number()),
  })),
  total_topics: z.number(),
  covered_topics: z.number(),
  coverage_rate: z.number(),
});

export function safeParse(schema, data, file) {
  const r = schema.safeParse(data);
  if (r.success) return { ok: true, data: r.data };
  return {
    ok: false,
    file,
    issues: r.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
  };
}
