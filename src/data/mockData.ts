export interface Comment {
    id: string;
    questionId: string;
    author: string;
    content: string;
    likes: number;
    isLiked: boolean;
    createdAt: Date;
    isMine?: boolean;
}

export interface Question {
    id: string;
    title: string;
    content: string;
    author: string;
    commentCount: number;
    createdAt: Date;
    tags: string[];
}

export const MOCK_QUESTIONS: Question[] = [
    {
        id: '1',
        title: '첫 데이트 장소로 어디가 좋을까요?',
        content: '부담스럽지 않으면서도 분위기 있는 곳 추천해주세요! 이번 주말에 약속이 있는데 성수동이나 한남동 쪽으로 생각 중입니다. 너무 시끄럽지 않고 대화하기 좋은 곳이었으면 좋겠어요.',
        author: '달콤커플',
        commentCount: 25,
        createdAt: new Date(),
        tags: ['데이트', '첫만남'],
    },
    {
        id: '2',
        title: '기념일 선물 골라주세요!',
        content: '1주년 선물로 뭐가 의미 있을까요? 예산은 30만원 정도로 생각하고 있습니다. 여자친구가 좋아하는 브랜드가 딱히 없어서 평소에 잘 쓸 수 있는 가방이나 액세서리 중에서 고를까 해요.',
        author: '사랑꾼',
        commentCount: 15,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        tags: ['선물', '1주년'],
    },
    // ... rest of questions
    {
        id: '3',
        title: '싸웠을 때 화해하는 꿀팁 있나요?',
        content: '어색하지 않게 먼저 다가가고 싶어요. 서로 자존심이 세서 그런지 미안하다는 말이 잘 안 나오네요. 자연스럽게 화해할 수 있는 분위기 조성법이 있을까요?',
        author: '고민남',
        commentCount: 42,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        tags: ['화해', '고민'],
    },
    {
        id: '4',
        title: '장거리 연애 팁 공유해요',
        content: '서로 떨어져 있어도 잘 지내는 방법이 있을까요? 이번에 제가 지방으로 발령을 받게 되어서 강제로 롱디가 되었네요. 연락 빈도나 만나는 횟수 등을 어떻게 조율하면 좋을까요?',
        author: '롱디롱디',
        commentCount: 8,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        tags: ['장거리', '팁'],
    },
    {
        id: '5',
        title: '함께 여행 가기 좋은 국내 여행지',
        content: '이번 주말에 1박 2일로 갈만한 곳 있을까요? 운전은 제가 할 수 있고 너무 멀지 않은 경기도나 강원도 쪽이면 좋을 것 같습니다.',
        author: '여행홀릭',
        commentCount: 12,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        tags: ['여행', '추천'],
    },
    {
        id: '6',
        title: '서로의 MBTI 궁합 어때요?',
        content: '우리 커플은 ENFP와 INTJ인데 잘 맞나요? 성격이 정말 반대인데 가끔은 잘 맞고 가끔은 정말 안 맞는 것 같아요. 다른 분들은 어떤가요?',
        author: 'MBTI덕후',
        commentCount: 33,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
        tags: ['MBTI', '궁합'],
    }
];

export const MOCK_COMMENTS: Comment[] = [
    {
        id: 'c1',
        questionId: '1',
        author: '연애박사',
        content: '성수동에 "OOO"이라는 레스토랑 좋더라구요! 예약 꼭 하세요.',
        likes: 12,
        isLiked: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
        id: 'c2',
        questionId: '1',
        author: '나도커플',
        content: '한남동 "XXX" 카페 디저트가 맛있어요.',
        likes: 5,
        isLiked: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
        id: 'c3',
        questionId: '1',
        author: '본인사용자',
        content: '감사합니다! 예약 시도해볼게요.',
        likes: 0,
        isLiked: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 10),
        isMine: true,
    },
    // 더 많은 댓글들...
    ...Array.from({ length: 20 }).map((_, i) => ({
        id: `c-extra-${i}`,
        questionId: '1',
        author: `유저${i}`,
        content: `댓글 본문 예시입니다 ${i + 1}. 무한 스크롤을 테스트하기 위한 데이터입니다.`,
        likes: Math.floor(Math.random() * 20),
        isLiked: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * (i + 2)),
    }))
];
