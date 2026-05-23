export const SELF_ASSESSMENT = [
  {
    "format": "Format 1",
    "level": "IL",
    "level_kr": "최고등급 IL",
    "tts_rate": 0.55,
    "options": [
      {
        "id": "f1_1",
        "description": "나는 10단어 이하의 단어로 말할 수 있습니다.",
        "sample_en": "I like coffee. It is good.",
        "sample_kr": "(간단한 10단어 이하의 문장)"
      },
      {
        "id": "f1_2",
        "description": "나는 기본적임 물건, 색깔, 요일, 음식, 의류, 숫자 등을 말할 수 있습니다. 나는 항상 완벽한 문장을 구사하지 못하고 간단한 질문도 하기 어렵습니다.",
        "sample_en": "This is a red pen. I have two books. Today is Monday. I like Korean food. I wear a blue shirt. But I cannot make perfect sentences.",
        "sample_kr": "(기본적 물건, 색깔, 요일, 음식, 의류, 숫자 언급)"
      }
    ]
  },
  {
    "format": "Format 2",
    "level": "IH",
    "level_kr": "최고등급 IH",
    "tts_rate": 0.77,
    "options": [
      {
        "id": "f2_1",
        "description": "나는 나 자신, 직장, 친한 사람과 장소, 일상에 대한 기본적인 정보를 간단한 문장으로 전달할 수 있습니다. 간단한 질문을 할 수 있습니다.",
        "sample_en": "My name is Min-jun. I work at a technology company in Seoul. I have been working there for three years. My office is near the subway station. I usually have lunch with my colleagues. Do you work or study?",
        "sample_kr": "(자신, 직장, 일상 정보 전달 + 간단한 질문)"
      },
      {
        "id": "f2_2",
        "description": "나는 나 자신, 일상, 일/학교와 취미에 대해 간단한 대화를 할 수 있습니다. 나는 이 친근한 주제와 일상에 대해 쉽게 간단한 문장들을 만들수 있습니다. 나는 또한 내가 원하는 질문도 할 수 있습니다.",
        "sample_en": "I enjoy my daily routine. In the morning, I exercise for thirty minutes and then go to work. After work, I sometimes play basketball with my friends. On weekends, I like to read books or watch movies. What do you usually do in your free time? I'd love to hear about your hobbies too.",
        "sample_kr": "(일상, 취미에 대한 간단한 대화 + 자신있는 질문)"
      }
    ]
  },
  {
    "format": "Format 3",
    "level": "AL",
    "level_kr": "최고등급 AL",
    "tts_rate": 0.8,
    "options": [
      {
        "id": "f3_1",
        "description": "나는 친근한 주제와 가정, 일, 학교, 개인과 사회적 관심사에 대해 자신있게 대화할 수 있습니다. 나는 일어난 일과 일어나고 있는 일, 일어날 일에 대해 합리적으로 자신있게 말할 수 있습니다. 필요한 경우 설명도 할 수 있습니다. 일상 생활에서 예기치 못한 상황이 발생하더라도 임기응변으로 대처할 수 있습니다.",
        "sample_en": "I can confidently talk about my family, work, and personal interests. Last year, I led a major project at work that improved our team's productivity by twenty percent. Currently, I'm learning new programming skills to stay competitive. In the future, I plan to take on more leadership responsibilities. Even when unexpected problems arise, I can think on my feet and find solutions. For example, when a client changed requirements at the last minute, I quickly adjusted our plan and delivered on time.",
        "sample_kr": "(과거/현재/미래 설명 + 예기치 못한 상황 대처)"
      },
      {
        "id": "f3_2",
        "description": "나는 개인적, 사회적 또는 전문적 주제에 나의 의견을 제시하여 토론할 수 있습니다. 나는 다양하고 어려운 주제에 대해 정확하고 다양한 어휘를 사용하여 자세히 설명할 수 있습니다.",
        "sample_en": "In my opinion, the impact of artificial intelligence on the workforce is a double-edged sword. While automation undoubtedly increases efficiency and productivity, it also raises legitimate concerns about job displacement and the widening skill gap. From a professional standpoint, I believe that organizations must invest in reskilling programs to prepare their employees for this technological shift. Moreover, the ethical implications of AI decision-making in healthcare and finance require careful consideration and robust regulatory frameworks.",
        "sample_kr": "(사회적/전문적 주제 의견 제시 + 정확하고 다양한 어휘 사용)"
      }
    ]
  }
];

export const DIFFICULTY_OPTIONS = [
  {
    "id": "easy",
    "text": "쉬운 질문",
    "text_en": "Easy questions"
  },
  {
    "id": "similar",
    "text": "비슷한 질문",
    "text_en": "Similar questions"
  },
  {
    "id": "difficult",
    "text": "어려운 질문",
    "text_en": "Difficult questions"
  }
];
