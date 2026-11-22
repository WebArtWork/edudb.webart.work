/** From this age a person also tells their university. */
export const ADULT_AGE = 18;

const MIN_AGE = 3;
const MAX_AGE = 120;

/** Today as `YYYY-MM-DD`, the format of a date input. */
export function todayIso(today = new Date()): string {
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');

	return `${today.getFullYear()}-${month}-${day}`;
}

/** The age in whole years on `today`, or `null` when the text is not a real date in a believable range. */
export function ageOf(birthDate: string, today = new Date()): number | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);

	if (!match) return null;

	const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
	const date = new Date(year, month - 1, day);

	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
		return null;

	let age = today.getFullYear() - year;

	if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day))
		age--;

	return age >= MIN_AGE && age <= MAX_AGE ? age : null;
}
