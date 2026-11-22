export type CategoryGroup = 'school' | 'work';

/** A teacher document (Firestore: edudb_teachers/{slug}). */
export interface Teacher {
	slug: string;
	uid: string;
	name: string;
	role: string;
	subject: string;
	short: string;
	bio: string;
	topics: string[];
	apps: string[];
	categories: string[];
	photoUrl: string;
}

export interface EduApp {
	slug: string;
	name: string;
	url: string;
	tagline: string;
	desc: string;
	price: string;
	platforms: string;
	features: string[];
	categories: string[];
}

export interface Category {
	slug: string;
	name: string;
	group: CategoryGroup;
	tagline: string;
	desc: string;
}

export const apps: EduApp[] = [
	{
		slug: 'business',
		name: 'Business',
		url: 'https://business.webart.work',
		tagline: 'Explore lessons on strategy, finance and marketing.',
		categories: ['business'],
		desc: 'A learning platform for strategy, startups, marketing, finance, operations, leadership and decision making. Each theory is a short, structured lesson you can apply at work.',
		price: 'Free',
		platforms: 'Web',
		features: [
			'Strategy and startups',
			'Marketing and finance',
			'Operations and leadership',
			'Decision making frameworks',
		],
	},
	{
		slug: 'chess',
		name: 'Chess',
		url: 'https://chess.webart.work',
		tagline: 'Practice chess by comparing promising moves.',
		categories: ['chess'],
		desc: 'Before you move, name the few strong options in the position. The exercises train that habit.',
		price: 'Free',
		platforms: 'Web, Android',
		features: [
			'Candidate move exercises',
			'Position-based practice',
			'Habit-building drills',
			'Android app',
		],
	},
	{
		slug: 'coder',
		name: 'Coder',
		url: 'https://coder.webart.work',
		tagline: 'Software architecture in 12 lessons.',
		categories: ['software'],
		desc: 'Twelve focused lessons on requirements, project structure, module boundaries, dependencies and more. For developers who want to design software as well as write it.',
		price: 'Free',
		platforms: 'Web, Android',
		features: [
			'12 focused lessons',
			'Requirements and structure',
			'Module boundaries',
			'Dependency management',
		],
	},
	{
		slug: 'cooking',
		name: 'Cooking',
		url: 'https://cooking.webart.work',
		tagline: 'Cooking lessons for everyday meals.',
		categories: ['cooking'],
		desc: 'Clear lessons on the techniques behind good food, starting with the basics and building toward everyday cooking.',
		price: 'Free',
		platforms: 'Web',
		features: [
			'Step by step lessons',
			'Core techniques',
			'Everyday recipes',
			'Prerendered, fast pages',
		],
	},
	{
		slug: 'mechanics',
		name: 'Mechanics',
		url: 'https://mechanics.webart.work',
		tagline: '100 theories of mechanics in 12 topics.',
		categories: ['physics'],
		desc: 'Forces and statics, friction, motion, energy, rotation and more. A reference and study site for the theory of mechanics.',
		price: 'Free',
		platforms: 'Web',
		features: [
			'100 theories',
			'12 topics',
			'From statics to rotation',
			'Clear, structured pages',
		],
	},
	{
		slug: 'medicine',
		name: 'Medicine',
		url: 'https://medicine.webart.work',
		tagline: 'Medical learning platform (in progress).',
		categories: ['medicine'],
		desc: 'We’re preparing the first medicine lessons.',
		price: 'Free',
		platforms: 'Web',
		features: ['Structured lessons', 'Study-friendly pages', 'Content coming soon'],
	},
	{
		slug: 'physics',
		name: 'Physics',
		url: 'https://physics.webart.work',
		tagline: 'Study physics from the basics and review before exams.',
		categories: ['physics'],
		desc: 'Readable physics lessons and fast study pages, from the basics to deeper topics. Easy to scan and to revisit before exams.',
		price: 'Free',
		platforms: 'Web',
		features: [
			'Readable lessons',
			'Fast study pages',
			'Exam-friendly structure',
			'Prerendered for speed',
		],
	},
	{
		slug: 'realestate',
		name: 'Real Estate',
		url: 'https://realestate.webart.work',
		tagline: 'Read about buying, selling and managing property.',
		categories: ['real-estate'],
		desc: 'A property learning platform covering the ideas behind buying, selling, investing and managing real estate.',
		price: 'Free',
		platforms: 'Web',
		features: ['Property basics', 'Investing concepts', 'Market basics', 'Practical examples'],
	},
	{
		slug: 'trainup',
		name: 'TrainUp',
		url: 'https://trainup.work',
		tagline: 'Visual workout planning that adapts to you.',
		categories: ['fitness'],
		desc: 'Choose a goal, describe your level, equipment, space and schedule, and TrainUp builds an achievable program with exercise images and tap-based controls. No prompts needed.',
		price: 'Free',
		platforms: 'Web, mobile-first',
		features: [
			'Goal-based programs',
			'Exercise images',
			'Progress tracking',
			'Adapts each workout',
		],
	},
];

export const categories: Category[] = [
	{
		slug: 'maths',
		name: 'Maths',
		group: 'school',
		tagline: 'Algebra, geometry and exam preparation.',
		desc: 'Practice algebra and geometry or prepare for an exam with a teacher.',
	},
	{
		slug: 'physics',
		name: 'Physics',
		group: 'school',
		tagline: 'Physics and mechanics, from basics to theory.',
		desc: 'Lessons and theory sites for physics and mechanics, plus a teacher for the hard topics.',
	},
	{
		slug: 'biology',
		name: 'Biology',
		group: 'school',
		tagline: 'Life, the body and the environment.',
		desc: 'Core biology for school and exams.',
	},
	{
		slug: 'languages',
		name: 'Languages',
		group: 'school',
		tagline: 'Speak, read and write a new language.',
		desc: 'Daily practice and coaching for foreign languages.',
	},
	{
		slug: 'chess',
		name: 'Chess and logic',
		group: 'school',
		tagline: 'Compare possible moves before you play.',
		desc: 'Chess exercises that train you to check your options before you decide.',
	},
	{
		slug: 'business',
		name: 'Business',
		group: 'work',
		tagline: 'Strategy, marketing, finance and leadership.',
		desc: 'Frameworks and theories you can use at work or when starting your own company.',
	},
	{
		slug: 'software',
		name: 'Software',
		group: 'work',
		tagline: 'Design and build software.',
		desc: 'Architecture and engineering lessons for developers and career changers.',
	},
	{
		slug: 'real-estate',
		name: 'Real estate',
		group: 'work',
		tagline: 'Buying, selling and managing property.',
		desc: 'How the property market works, for agents, investors and owners.',
	},
	{
		slug: 'medicine',
		name: 'Medicine',
		group: 'work',
		tagline: 'Medical knowledge for study and practice.',
		desc: 'Learning for students and people working in health.',
	},
	{
		slug: 'cooking',
		name: 'Cooking',
		group: 'work',
		tagline: 'Techniques for home and professional kitchens.',
		desc: 'Lessons that start from the basics and build kitchen skill.',
	},
	{
		slug: 'fitness',
		name: 'Fitness',
		group: 'work',
		tagline: 'Training plans and healthy habits.',
		desc: 'Workout planning for people and for those who coach them.',
	},
];

export const categoryGroups: Record<CategoryGroup, string> = {
	school: 'School lessons',
	work: 'Work and professions',
};
