export interface Link {
  label: string;
  url: string;
}

export interface HeroSection {
  title: string;
  subtitle: string;
  imageUrl: string;
  youtubeUrl: string;
  links: Link[];
}

export interface NavAction {
  title: string;
  url: string;
  active: boolean;
}

export interface InfoItem {
  title: string;
  content: string;
}

export interface LandingPageContent {
  hero: HeroSection;
  prayerForest: NavAction;
  monthly181: NavAction;
  generalInfo: InfoItem[];
  updatedAt?: any;
}

export const DEFAULT_CONTENT: LandingPageContent = {
  hero: {
    title: "we 181",
    subtitle: "사랑과 은혜가 넘치는 공동체",
    imageUrl: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=2000",
    youtubeUrl: "",
    links: [
      { label: "예배 안내", url: "#" },
      { label: "오시는 길", url: "#" }
    ]
  },
  prayerForest: {
    title: "기도의 숲",
    url: "https://pray4u-2026-ksj.web.app",
    active: true
  },
  monthly181: {
    title: "we 181",
    url: "https://heyzine.com/flip-book/b3f0b1db58.html",
    active: true
  },
  generalInfo: [
    {
      title: "주중 모임 안내",
      content: "화요일 오후 7시: 성경 공부\n목요일 오전 10시: 어머니 기도회"
    },
    {
      title: "교회 소식",
      content: "이번 주 주일 예배 후 공동 의회가 있습니다."
    }
  ]
};
