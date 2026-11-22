import {
	apps,
	categories,
	categoryGroups,
	type Category,
	type EduApp,
	type Teacher,
} from './edudb.data';

export { categoryGroups };

export const getApp = (slug: string): EduApp | undefined => apps.find((app) => app.slug === slug);

export const getCategory = (slug: string): Category | undefined =>
	categories.find((category) => category.slug === slug);

export const appsOfCategory = (category: Category): EduApp[] =>
	apps.filter((app) => app.categories.includes(category.slug));

/** Teachers come from Firestore, so the list is passed in. */
export const teachersOfCategory = (teachers: Teacher[], category: Category): Teacher[] =>
	teachers.filter((teacher) => teacher.categories.includes(category.slug));

export const teachersOfApp = (teachers: Teacher[], app: EduApp): Teacher[] =>
	teachers.filter((teacher) => teacher.apps.includes(app.slug));

export const categoriesByGroup = (group: Category['group']): Category[] =>
	categories.filter((category) => category.group === group);

export const initials = (name: string): string =>
	name
		.split(' ')
		.map((word) => word[0])
		.join('');

/** A stable colour for an avatar or icon, derived from its slug. */
export function hueOf(value: string): number {
	return [...value].reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 360, 7);
}
