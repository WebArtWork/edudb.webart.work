const appSubjects: Record<string, string> = {
	coder: 'software',
	realestate: 'real-estate',
	trainup: 'fitness',
};

/** Categories without their own photo yet borrow a related one. */
const subjectPhotoFallbacks: Record<string, string> = {
	ukrainian: 'languages',
	english: 'languages',
	chemistry: 'physics',
	astronomy: 'physics',
	history: 'library',
	geography: 'library',
};

export function subjectPhoto(slug: string): string {
	return `images/${subjectPhotoFallbacks[slug] ?? slug}.webp`;
}

export function appPhoto(slug: string): string {
	return subjectPhoto(appSubjects[slug] ?? slug);
}
