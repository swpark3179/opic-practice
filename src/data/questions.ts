export const BGS_QUESTIONS = [
  {
    "id": "occupation",
    "q": "현재 귀하는 어느 분야에 종사하고 계십니까?",
    "q_en": "Which field are you currently working in?",
    "min_select": 1,
    "options": [
      {
        "id": "business",
        "text": "사업/회사",
        "text_en": "Business/Company"
      },
      {
        "id": "remote",
        "text": "재택근무/재택사업",
        "text_en": "Remote work/Home business"
      },
      {
        "id": "teacher",
        "text": "교사/교육자",
        "text_en": "Teacher/Educator"
      },
      {
        "id": "military",
        "text": "군복무",
        "text_en": "Military service"
      },
      {
        "id": "no_work",
        "text": "일 경험 없음",
        "text_en": "No work experience",
        "is_excluded": true
      }
    ]
  },
  {
    "id": "student",
    "q": "현재 귀하는 학생이십니까?",
    "q_en": "Are you currently a student?",
    "min_select": 1,
    "options": [
      {
        "id": "yes_student",
        "text": "네",
        "text_en": "Yes"
      },
      {
        "id": "no_student",
        "text": "아니오",
        "text_en": "No",
        "is_excluded": true
      }
    ]
  },
  {
    "id": "study_purpose",
    "q": "이전에 들었던 강의 목적은 무엇입니까?",
    "q_en": "What was the purpose of your previous courses?",
    "min_select": 1,
    "options": [
      {
        "id": "degree",
        "text": "학위 과정 수업",
        "text_en": "Degree program courses"
      },
      {
        "id": "lifelong",
        "text": "전문 기술 향상을 위한 평생 학습",
        "text_en": "Lifelong learning for professional skills"
      },
      {
        "id": "language",
        "text": "어학 수업",
        "text_en": "Language courses"
      },
      {
        "id": "over_5years",
        "text": "수강 후 5년 이상 지남",
        "text_en": "Over 5 years since last course",
        "is_excluded": true
      }
    ]
  },
  {
    "id": "living",
    "q": "현재 귀하는 어디에 살고 계십니까?",
    "q_en": "Where do you currently live?",
    "min_select": 1,
    "options": [
      {
        "id": "alone",
        "text": "개인주택이나 아파트에 홀로 거주",
        "text_en": "Living alone in a house/apartment"
      },
      {
        "id": "roommate",
        "text": "친구나 룸메이트와 함께 주택이나 아파트에 거주",
        "text_en": "With friends/roommates"
      },
      {
        "id": "family",
        "text": "가족(배우자/자녀/기타 가족 일원)과 함께 주택이나 아파트에 거주",
        "text_en": "With family"
      },
      {
        "id": "dormitory",
        "text": "학교 기숙사",
        "text_en": "School dormitory"
      },
      {
        "id": "military_barracks",
        "text": "군대 막사",
        "text_en": "Military barracks"
      }
    ]
  },
  {
    "id": "leisure",
    "q": "귀하는 여가 활동으로 주로 무엇을 합니까? (두 개 이상 선택)",
    "q_en": "What do you mainly do for leisure activities? (Select 2 or more)",
    "min_select": 2,
    "options": [
      {
        "id": "movies",
        "text": "영화보기",
        "text_en": "Watching movies"
      },
      {
        "id": "club",
        "text": "클럽/나이트클럽 가기",
        "text_en": "Going to clubs/nightclubs"
      },
      {
        "id": "performance",
        "text": "공연보기",
        "text_en": "Watching performances",
        "is_excluded": true
      },
      {
        "id": "concert",
        "text": "콘서트 보기",
        "text_en": "Going to concerts",
        "is_excluded": true
      },
      {
        "id": "museum",
        "text": "박물관가기",
        "text_en": "Visiting museums"
      },
      {
        "id": "park",
        "text": "공원 가기",
        "text_en": "Going to parks"
      },
      {
        "id": "camping",
        "text": "캠핑하기",
        "text_en": "Camping"
      },
      {
        "id": "beach",
        "text": "해변가기",
        "text_en": "Going to the beach"
      },
      {
        "id": "sports_watch",
        "text": "스포츠 관람",
        "text_en": "Watching sports"
      },
      {
        "id": "home_improvement",
        "text": "주거개선",
        "text_en": "Home improvement"
      },
      {
        "id": "bar_pub",
        "text": "술집/바에 가기",
        "text_en": "Going to bars/pubs"
      },
      {
        "id": "cafe",
        "text": "카페/커피전문점 가기",
        "text_en": "Going to cafes"
      },
      {
        "id": "games",
        "text": "게임하기(비디오, 카드, 보드, 휴대폰 등)",
        "text_en": "Playing games"
      },
      {
        "id": "billiards",
        "text": "당구 치기",
        "text_en": "Playing billiards"
      },
      {
        "id": "chess",
        "text": "체스하기",
        "text_en": "Playing chess"
      },
      {
        "id": "sns",
        "text": "SNS에 글 올리기",
        "text_en": "Posting on SNS"
      },
      {
        "id": "texting",
        "text": "친구들과 문자대화하기",
        "text_en": "Texting friends"
      },
      {
        "id": "exam_prep",
        "text": "시험 대비 과정 수강하기",
        "text_en": "Taking exam prep courses"
      },
      {
        "id": "volunteer",
        "text": "구직활동하기",
        "text_en": "Job hunting"
      },
      {
        "id": "reality_show",
        "text": "리얼리티쇼 시청하기",
        "text_en": "Watching reality shows"
      },
      {
        "id": "news",
        "text": "뉴스를 보거나 듣기",
        "text_en": "Watching/listening to news"
      },
      {
        "id": "cooking_show",
        "text": "요리 관련 프로그램 시청하기",
        "text_en": "Watching cooking shows"
      },
      {
        "id": "shopping",
        "text": "쇼핑하기",
        "text_en": "Shopping"
      },
      {
        "id": "drive",
        "text": "차로 드라이브하기",
        "text_en": "Going for drives"
      },
      {
        "id": "spa",
        "text": "스파/마사지샵 가기",
        "text_en": "Going to spas/massage shops"
      },
      {
        "id": "tv",
        "text": "TV 시청하기",
        "text_en": "Watching TV"
      },
      {
        "id": "volunteer_work",
        "text": "자원봉사하기",
        "text_en": "Volunteering"
      }
    ]
  },
  {
    "id": "hobby",
    "q": "귀하의 취미나 관심사는 무엇입니까? (한 개 이상 선택)",
    "q_en": "What are your hobbies or interests? (Select 1 or more)",
    "min_select": 1,
    "options": [
      {
        "id": "read_kids",
        "text": "아이에게 책 읽어주기",
        "text_en": "Reading books to children"
      },
      {
        "id": "music",
        "text": "음악 감상하기",
        "text_en": "Listening to music"
      },
      {
        "id": "play_instrument",
        "text": "악기 연주하기",
        "text_en": "Playing musical instruments"
      },
      {
        "id": "writing",
        "text": "글쓰기(편지, 단문, 시 등)",
        "text_en": "Writing (letters, essays, poetry)"
      },
      {
        "id": "drawing",
        "text": "그림그리기",
        "text_en": "Drawing"
      },
      {
        "id": "cooking",
        "text": "요리하기",
        "text_en": "Cooking"
      },
      {
        "id": "pets",
        "text": "애완동물 기르기",
        "text_en": "Raising pets"
      },
      {
        "id": "reading",
        "text": "독서",
        "text_en": "Reading"
      },
      {
        "id": "dance",
        "text": "춤추기",
        "text_en": "Dancing"
      },
      {
        "id": "stocks",
        "text": "주식 투자하기",
        "text_en": "Stock investing"
      },
      {
        "id": "newspaper",
        "text": "신문 읽기",
        "text_en": "Reading newspapers"
      },
      {
        "id": "travel_blog",
        "text": "여행 관련 잡지나 블로그 읽기",
        "text_en": "Reading travel magazines/blogs"
      },
      {
        "id": "photography",
        "text": "사진 촬영하기",
        "text_en": "Photography"
      },
      {
        "id": "singing",
        "text": "혼자 노래 부르거나 합창하기",
        "text_en": "Singing alone or in chorus"
      }
    ]
  },
  {
    "id": "sports",
    "q": "귀하는 주로 어떤 운동을 즐기십니까? (한 개 이상 선택)",
    "q_en": "What sports do you mainly enjoy? (Select 1 or more)",
    "min_select": 1,
    "options": [
      {
        "id": "basketball",
        "text": "농구",
        "text_en": "Basketball"
      },
      {
        "id": "baseball",
        "text": "야구/소프트볼",
        "text_en": "Baseball/Softball"
      },
      {
        "id": "soccer",
        "text": "축구",
        "text_en": "Soccer"
      },
      {
        "id": "futsal",
        "text": "미식축구",
        "text_en": "American football"
      },
      {
        "id": "hockey",
        "text": "하키",
        "text_en": "Hockey"
      },
      {
        "id": "croquet",
        "text": "크로켓",
        "text_en": "Croquet"
      },
      {
        "id": "golf",
        "text": "골프",
        "text_en": "Golf"
      },
      {
        "id": "volleyball",
        "text": "배구",
        "text_en": "Volleyball"
      },
      {
        "id": "tennis",
        "text": "테니스",
        "text_en": "Tennis"
      },
      {
        "id": "badminton",
        "text": "배드민턴",
        "text_en": "Badminton"
      },
      {
        "id": "table_tennis",
        "text": "탁구",
        "text_en": "Table tennis"
      },
      {
        "id": "swimming",
        "text": "수영",
        "text_en": "Swimming"
      },
      {
        "id": "cycling",
        "text": "자전거",
        "text_en": "Cycling"
      },
      {
        "id": "skiing",
        "text": "스키/스노보드",
        "text_en": "Skiing/Snowboarding"
      },
      {
        "id": "ice_skating",
        "text": "아이스 스케이트",
        "text_en": "Ice skating"
      },
      {
        "id": "jogging",
        "text": "조깅",
        "text_en": "Jogging",
        "is_excluded": true
      },
      {
        "id": "walking",
        "text": "걷기",
        "text_en": "Walking",
        "is_excluded": true
      },
      {
        "id": "yoga",
        "text": "요가",
        "text_en": "Yoga"
      },
      {
        "id": "hiking",
        "text": "하이킹/트레킹",
        "text_en": "Hiking/Trekking"
      },
      {
        "id": "fishing",
        "text": "낚시",
        "text_en": "Fishing"
      },
      {
        "id": "gym",
        "text": "헬스",
        "text_en": "Gym/Weight training"
      },
      {
        "id": "taekwondo",
        "text": "태권도",
        "text_en": "Taekwondo"
      },
      {
        "id": "sports_class",
        "text": "운동 수업 수강하기",
        "text_en": "Taking sports classes"
      },
      {
        "id": "no_sports",
        "text": "운동을 전혀 하지 않음",
        "text_en": "No sports at all",
        "is_excluded": true
      }
    ]
  },
  {
    "id": "travel",
    "q": "당신은 어떤 휴가나 출장을 다녀온 경험이 있습니까? (한 개 이상 선택)",
    "q_en": "What kind of vacation or business trip experience do you have? (Select 1 or more)",
    "min_select": 1,
    "options": [
      {
        "id": "domestic_business",
        "text": "국내출장",
        "text_en": "Domestic business trip"
      },
      {
        "id": "overseas_business",
        "text": "해외출장",
        "text_en": "Overseas business trip"
      },
      {
        "id": "staycation",
        "text": "집에서 보내는 휴가",
        "text_en": "Staycation"
      },
      {
        "id": "domestic_travel",
        "text": "국내여행",
        "text_en": "Domestic travel"
      },
      {
        "id": "overseas_travel",
        "text": "해외여행",
        "text_en": "Overseas travel"
      }
    ]
  }
];
