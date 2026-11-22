const appSubjects: Record<string, string> = {
	coder: 'software',
	realestate: 'real-estate',
	trainup: 'fitness',
};

export function subjectPhoto(slug: string): string {
	return `images/${slug}.webp`;
}

export function appPhoto(slug: string): string {
	return subjectPhoto(appSubjects[slug] ?? slug);
}
