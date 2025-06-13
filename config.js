export const CONFIG = {
  // 초기 개체 수
  INITIAL_GRAZERS: 150,
  INITIAL_HUNTERS: 7,

  // 시뮬레이션 환경
  WORLD_RESOLUTION: 20,
  QUADTREE_CAPACITY: 4,

  // 생명체 공통 설정
  CREATURE: {
    REPRODUCTION_ENERGY_COST: 0.5,
    METABOLISM_COST: 0.15,
    MAX_SPEED: 3,
    MAX_FORCE: 0.1,
  },

  // 그래이저 설정
  GRAZER: {
    REPRODUCTION_THRESHOLD: 180,
    // --- 힘과 반경 ---
    SEPARATION_RADIUS: 24, // 다른 그래이저와 떨어지려는 반경
    FLEE_RADIUS: 100, // 헌터를 보고 도망가기 시작하는 반경
    FOOD_SEEK_FORCE: 0.8, // 음식(에너지 필드)을 찾아가는 힘
    SEPARATION_FORCE: 1.5, // 동족을 피하는 힘
    FLEE_FORCE: 3.0, // 헌터를 피해 도망가는 힘
  },

  // 헌터 설정
  HUNTER: {
    INITIAL_ENERGY: 200,
    REPRODUCTION_THRESHOLD: 300,
    // --- 힘과 반경 ---
    SEPARATION_RADIUS: 40, // 다른 헌터를 피하는 반경
    HUNT_RADIUS: 150, // 그래이저를 감지하는 반경
    ATTACK_RADIUS: 7, // 공격(에너지 흡수) 반경
    HUNT_FORCE: 1.2, // 그래이저를 쫓는 힘
    SEPARATION_FORCE: 1.0, // 동족을 피하는 힘
    ENERGY_DRAIN_RATE: 5.0, // 공격 시 그래이저의 에너지를 뺏는 속도
  },
};
