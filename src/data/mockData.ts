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
        content: '부담스럽지 않으면서도 분위기 있는 곳 추천해주세요!',
        author: '달콤커플',
        commentCount: 25,
        createdAt: new Date(),
        tags: ['데이트', '첫만남'],
    },
    {
        id: '2',
        title: '기념일 선물 골라주세요!',
        content: '1주년 선물로 뭐가 의미 있을까요?',
        author: '사랑꾼',
        commentCount: 15,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        tags: ['선물', '1주년'],
    },
    {
        id: '3',
        title: '싸웠을 때 화해하는 꿀팁 있나요?',
        content: '어색하지 않게 먼저 다가가고 싶어요.',
        author: '고민남',
        commentCount: 42,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        tags: ['화해', '고민'],
    },
    {
        id: '4',
        title: '장거리 연애 팁 공유해요',
        content: '서로 떨어져 있어도 잘 지내는 방법이 있을까요?',
        author: '롱디롱디',
        commentCount: 8,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        tags: ['장거리', '팁'],
    },
    {
        id: '5',
        title: '함께 여행 가기 좋은 국내 여행지',
        content: '이번 주말에 1박 2일로 갈만한 곳 있을까요?',
        author: '여행홀릭',
        commentCount: 12,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        tags: ['여행', '추천'],
    },
    {
        id: '6',
        title: '서로의 MBTI 궁합 어때요?',
        content: '우리 커플은 ENFP와 INTJ인데 잘 맞나요?',
        author: 'MBTI덕후',
        commentCount: 33,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
        tags: ['MBTI', '궁합'],
    }
];
