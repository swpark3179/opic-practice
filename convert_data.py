import os
import sys
import json

sys.path.append(r"C:\Users\s-wpa\Desktop\OPIC")
import questions

def write_ts_file(path, var_name, data):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(f"export const {var_name} = {json.dumps(data, ensure_ascii=False, indent=2)};\n")

# questions.ts
write_ts_file("src/data/questions.ts", "BGS_QUESTIONS", questions.BGS_QUESTIONS)

# selfAssessment.ts
with open("src/data/selfAssessment.ts", 'w', encoding='utf-8') as f:
    f.write(f"export const SELF_ASSESSMENT = {json.dumps(questions.SELF_ASSESSMENT, ensure_ascii=False, indent=2)};\n\n")
    f.write(f"export const DIFFICULTY_OPTIONS = {json.dumps(questions.DIFFICULTY_OPTIONS, ensure_ascii=False, indent=2)};\n")

# mainTopics.ts
with open("src/data/mainTopics.ts", 'w', encoding='utf-8') as f:
    f.write(f"export const MAIN_TEST_TOPICS = {json.dumps(questions.MAIN_TEST_TOPICS, ensure_ascii=False, indent=2)};\n\n")


# mappings.ts
with open("src/data/mappings.ts", 'w', encoding='utf-8') as f:
    f.write(f"export const BGS_TO_TASKS = {json.dumps(questions.BGS_TO_TASKS, ensure_ascii=False, indent=2)};\n\n")
    f.write(f"export const CATEGORY_TASK_MAPPING = {json.dumps(questions.CATEGORY_TASK_MAPPING, ensure_ascii=False, indent=2)};\n\n")
    # TOPIC_CATEGORIES has tuple keys which can't be JSON serialized directly.
    # We will convert it to a string key "task_key|topic_title"
    topic_categories_json = {f"{k[0]}|{k[1]}": v for k, v in questions.TOPIC_CATEGORIES.items()}
    f.write(f"export const TOPIC_CATEGORIES = {json.dumps(topic_categories_json, ensure_ascii=False, indent=2)};\n")

# knowledge.ts
with open(r"C:\Users\s-wpa\Desktop\OPIC\knowledge\knowledge.json", 'r', encoding='utf-8') as f:
    knowledge_json = json.load(f)
with open(r"C:\Users\s-wpa\Desktop\OPIC\knowledge\bgs_recommendations.json", 'r', encoding='utf-8') as f:
    bgs_rec_json = json.load(f)

with open("src/data/knowledge.ts", 'w', encoding='utf-8') as f:
    f.write(f"export const KNOWLEDGE_BASE = {json.dumps(knowledge_json, ensure_ascii=False, indent=2)};\n\n")
    f.write(f"export const BGS_RECOMMENDATIONS = {json.dumps(bgs_rec_json, ensure_ascii=False, indent=2)};\n")

print("Data conversion complete.")
