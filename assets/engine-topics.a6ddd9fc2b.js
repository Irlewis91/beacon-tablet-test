// Interest ids map to one of 16 topic families (data/topic-map.json).

export function allTopics(topicMap) {
  return Object.keys(topicMap.topics);
}

export function topicOf(interestId, topicMap) {
  for (const [topic, ids] of Object.entries(topicMap.topics)) if (ids.includes(interestId)) return topic;
  return null;
}

// Unique topics in the order the interests were picked. Surprise or no interests means all topics.
export function activeTopics(learner, topicMap) {
  if (learner.surprise || !learner.interests || learner.interests.length === 0) return allTopics(topicMap);
  const out = [];
  for (const id of learner.interests) {
    const t = topicOf(id, topicMap);
    if (t && !out.includes(t)) out.push(t);
  }
  return out.length ? out : allTopics(topicMap);
}

// The learner's first chosen interest that maps to a topic, or null.
export function interestForTopic(learner, topic, topicMap) {
  if (learner.surprise) return null;
  for (const id of learner.interests || []) if (topicOf(id, topicMap) === topic) return id;
  return null;
}

// Every interest id in every band must map to exactly one topic.
export function checkCoverage(interests, topicMap) {
  const count = {};
  for (const ids of Object.values(topicMap.topics)) for (const id of ids) count[id] = (count[id] || 0) + 1;
  const missing = [];
  const duplicates = [];
  for (const list of Object.values(interests.bands)) {
    for (const { id } of list) {
      if (!count[id]) missing.push(id);
      else if (count[id] > 1 && !duplicates.includes(id)) duplicates.push(id);
    }
  }
  return { missing: [...new Set(missing)], duplicates };
}
