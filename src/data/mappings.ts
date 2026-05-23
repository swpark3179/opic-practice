export const BGS_TO_TASKS = {
  "leisure": {
    "movies": [
      "describe",
      "talk_about"
    ],
    "museum": [
      "describe",
      "talk_about"
    ],
    "park": [
      "describe",
      "story"
    ],
    "camping": [
      "story",
      "describe"
    ],
    "beach": [
      "story",
      "describe"
    ],
    "sports_watch": [
      "comparison",
      "talk_about"
    ],
    "cafe": [
      "describe",
      "talk_about"
    ],
    "games": [
      "talk_about",
      "comparison"
    ],
    "shopping": [
      "comparison",
      "talk_about"
    ],
    "tv": [
      "talk_about"
    ],
    "news": [
      "talk_about"
    ],
    "default": [
      "talk_about",
      "describe"
    ]
  },
  "hobby": {
    "music": [
      "talk_about",
      "story"
    ],
    "reading": [
      "talk_about",
      "story"
    ],
    "cooking": [
      "talk_about",
      "story"
    ],
    "photography": [
      "describe",
      "story"
    ],
    "pets": [
      "story",
      "talk_about"
    ],
    "sports": [
      "comparison",
      "problem_solving"
    ],
    "travel": [
      "story",
      "hypothetical"
    ],
    "default": [
      "talk_about",
      "story"
    ]
  },
  "sports": {
    "basketball": [
      "comparison",
      "talk_about"
    ],
    "soccer": [
      "comparison",
      "talk_about"
    ],
    "swimming": [
      "comparison",
      "talk_about"
    ],
    "gym": [
      "talk_about",
      "problem_solving"
    ],
    "hiking": [
      "story",
      "describe"
    ],
    "tennis": [
      "comparison",
      "talk_about"
    ],
    "golf": [
      "comparison",
      "talk_about"
    ],
    "default": [
      "comparison",
      "talk_about"
    ]
  },
  "travel": {
    "domestic_travel": [
      "story",
      "describe"
    ],
    "overseas_travel": [
      "story",
      "hypothetical"
    ],
    "domestic_business": [
      "story",
      "talk_about"
    ],
    "overseas_business": [
      "story",
      "hypothetical"
    ],
    "staycation": [
      "describe",
      "talk_about"
    ],
    "default": [
      "story",
      "hypothetical"
    ]
  }
};

export const CATEGORY_TASK_MAPPING = {
  "personal": [
    "talk_about_yourself",
    "talk_about",
    "describe"
  ],
  "leisure": [
    "describe",
    "talk_about",
    "story",
    "comparison"
  ],
  "hobby": [
    "talk_about",
    "story",
    "describe"
  ],
  "sports": [
    "comparison",
    "talk_about",
    "problem_solving"
  ],
  "travel": [
    "story",
    "hypothetical",
    "describe"
  ],
  "surprise": [
    "problem_solving",
    "hypothetical",
    "comparison"
  ]
};

export const TOPIC_CATEGORIES = {
  "talk_about_yourself|Your Daily Routine": [
    "personal",
    "leisure",
    "hobby",
    "sports"
  ],
  "talk_about_yourself|Your Hobbies": [
    "personal",
    "hobby",
    "leisure"
  ],
  "talk_about_yourself|Your Family": [
    "personal"
  ],
  "describe|Your Favorite Room": [
    "personal"
  ],
  "describe|A Beautiful Place": [
    "travel",
    "leisure"
  ],
  "describe|Your Workspace": [
    "personal"
  ],
  "story|A Memorable Trip": [
    "travel",
    "leisure"
  ],
  "story|An Overcoming Experience": [
    "sports",
    "hobby",
    "personal"
  ],
  "story|A Helping Experience": [
    "personal"
  ],
  "talk_about|Social Media": [
    "leisure"
  ],
  "talk_about|Education": [
    "personal",
    "hobby"
  ],
  "talk_about|Health and Fitness": [
    "sports",
    "hobby",
    "leisure"
  ],
  "comparison|City vs. Countryside Life": [
    "travel",
    "personal"
  ],
  "comparison|Online vs. Traditional Learning": [
    "hobby",
    "personal"
  ],
  "comparison|Working Alone vs. Working in a Team": [
    "sports",
    "personal"
  ],
  "problem_solving|Traffic Congestion": [
    "travel",
    "personal"
  ],
  "problem_solving|Work-Life Balance": [
    "personal",
    "sports",
    "hobby"
  ],
  "problem_solving|Environmental Protection": [
    "surprise",
    "travel"
  ],
  "hypothetical|Winning the Lottery": [
    "surprise",
    "personal"
  ],
  "hypothetical|Living in Another Country": [
    "travel",
    "surprise"
  ],
  "hypothetical|Having a Superpower": [
    "surprise"
  ]
};
