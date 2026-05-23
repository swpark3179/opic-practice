import { GeneratedTest, TestCategory, Topic, Question } from '../data/types';
import { BGSAnswers } from '../context/AppContext';
import { MAIN_TEST_TOPICS } from '../data/mainTopics';
import { BGS_TO_TASKS, TOPIC_CATEGORIES } from '../data/mappings';

// Fallback logic for roleplay (since ROLEPLAY_PROMPTS was removed)
function generateRoleplayQuestion(taskKey: string, topicTitle: string, saLevel: string): Question {
  return {
    q: `[Roleplay] You are in a situation related to ${topicTitle}. Ask 3-4 questions to find out more information.`,
    kr: `[롤플레이] ${topicTitle}와 관련된 상황입니다. 상대방에게 3-4가지 질문을 하세요.`,
    sample: "Hi! I have a few questions about this. First... Second... Finally...",
    tip: "상황에 몰입해서 자연스럽게 질문을 이어나가세요.",
    is_roleplay: true
  };
}

export function generateMainTest(bgsAnswers: BGSAnswers, saLevel: 'IL' | 'IH' | 'AL', saDifficulty: string): GeneratedTest {
  const categories: TestCategory[] = [];
  const flatTopics: Topic[] = [];
  let totalQuestions = 0;

  const countCategories = ["leisure", "hobby", "sports", "travel"];
  const allSelectedOptions: string[] = [];
  
  for (const cat of countCategories) {
    if (bgsAnswers[cat]) {
      allSelectedOptions.push(...bgsAnswers[cat]);
    }
  }

  // Find active task keys from BGS
  const activeTaskKeys = new Set<string>();
  for (const opt of allSelectedOptions) {
    // BGS_TO_TASKS maps "category:option_id" -> task keys
    // In our mappings, keys are just option_ids or category:option
    // Let's iterate values to find mappings safely.
    for (const [key, tasks] of Object.entries(BGS_TO_TASKS as any as Record<string, string[]>)) {
      if (key.includes(opt) || key === opt) {
        tasks.forEach(t => activeTaskKeys.add(t));
      }
    }
  }

  // Always include self introduction
  activeTaskKeys.add('talk_about_yourself');

  // Convert Set to Array and shuffle
  const taskKeysArray = Array.from(activeTaskKeys).sort(() => Math.random() - 0.5);
  
  // Apply difficulty reduction
  let maxCategories = 5;
  if (saDifficulty === 'easy') maxCategories = 4;
  else if (saDifficulty === 'difficult') maxCategories = 6;
  
  const selectedTaskKeys = taskKeysArray.slice(0, maxCategories);

  // Fallback if not enough tasks (e.g. they selected very little)
  if (selectedTaskKeys.length === 0) {
    selectedTaskKeys.push('talk_about_yourself', 'describe', 'story');
  }

  for (const taskKey of selectedTaskKeys) {
    const taskData = (MAIN_TEST_TOPICS as any)[taskKey];
    if (!taskData) continue;

    // Pick 1-2 random topics from this task
    const topicsList = taskData.topics as Topic[];
    const shuffledTopics = [...topicsList].sort(() => Math.random() - 0.5);
    const numTopics = Math.floor(Math.random() * 2) + 1; // 1 or 2
    const selectedTopics = shuffledTopics.slice(0, numTopics);

    const categoryTopics: Topic[] = [];

    for (const topic of selectedTopics) {
      // Create a deep copy of questions
      const questions = [...topic.questions];
      
      // Add roleplay
      questions.push(generateRoleplayQuestion(taskKey, topic.title, saLevel));
      
      // Truncate samples if IL
      if (saLevel === 'IL') {
        questions.forEach(q => {
          q.sample = q.sample.split('.').slice(0, 3).join('.') + '.';
        });
      }

      const newTopic = { ...topic, questions };
      categoryTopics.push(newTopic);
      flatTopics.push(newTopic);
      totalQuestions += newTopic.questions.length;
    }

    categories.push({
      key: taskKey,
      name: taskData.name || taskKey,
      icon: '💬', // placeholder
      topics: categoryTopics
    });
  }

  // Add Surprise
  const allTasks = Object.keys(MAIN_TEST_TOPICS);
  const unselectedTasks = allTasks.filter(t => !activeTaskKeys.has(t));
  if (unselectedTasks.length > 0) {
    const surpriseTask = unselectedTasks[Math.floor(Math.random() * unselectedTasks.length)];
    const taskData = (MAIN_TEST_TOPICS as any)[surpriseTask];
    if (taskData && taskData.topics.length > 0) {
      const topic = taskData.topics[Math.floor(Math.random() * taskData.topics.length)];
      const questions = [...topic.questions, generateRoleplayQuestion(surpriseTask, topic.title, saLevel)];
      const newTopic = { ...topic, questions };
      
      categories.push({
        key: 'surprise',
        name: '돌발문제',
        icon: '🎲',
        topics: [newTopic]
      });
      flatTopics.push(newTopic);
      totalQuestions += newTopic.questions.length;
    }
  }

  return {
    categories,
    topics: flatTopics,
    totalQuestions,
    saLevel,
    saDifficulty
  };
}
