export const environment: {
	apiUrl: string;
	production: boolean;
	companyId: string;
	/** The language of the texts written in the code (English). Translations are looked up from it. */
	defaultLanguage: string;
	/** The language shown first, until a visitor picks another one. */
	initialLanguage: string;
	/** Public web config of the shared learning Firebase project: safe to ship. Access is enforced by Firebase Auth and Firestore rules. */
	firebase: {
		apiKey: string;
		authDomain: string;
		projectId: string;
		storageBucket: string;
		messagingSenderId: string;
		appId: string;
		measurementId: string;
	};
	/** Emails of the admins. The Firestore rules (firestore.rules, eduAdmin) hold the same list. */
	adminEmails: string[];
	languages: AppLanguage[];
} = {
	apiUrl: 'https://it.webart.work',
	production: true,
	companyId: 'demo',
	firebase: {
		apiKey: 'AIzaSyB2c85PUyTpz8Y92xGJDki2LAteOhQ-hY4',
		authDomain: 'learning-c2766.firebaseapp.com',
		projectId: 'learning-c2766',
		storageBucket: 'learning-c2766.firebasestorage.app',
		messagingSenderId: '232437004513',
		appId: '1:232437004513:web:8712a0949537a694611fa0',
		measurementId: 'G-47F1HP9G2M',
	},
	defaultLanguage: 'en',
	initialLanguage: 'ua',
	adminEmails: ['ceo@webart.work'],
	languages: [
		{
			code: 'ua',
			name: 'Ukrainian',
			nativeName: 'Українська',
			flagSrc: 'flags/ukraine.svg',
			htmlLang: 'uk',
			population: 35,
		},
		{
			code: 'en',
			name: 'English',
			nativeName: 'English',
			flagSrc: 'flags/united-kingdom.svg',
			htmlLang: 'en',
			population: 280,
		},
	],
};

export interface AppLanguage {
	code: string;
	name: string;
	nativeName: string;
	flagSrc: string;
	htmlLang: string;
	population: number;
}
