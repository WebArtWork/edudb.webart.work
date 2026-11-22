const LETTERS: Record<string, string> = {
	а: 'a',
	б: 'b',
	в: 'v',
	г: 'h',
	ґ: 'g',
	д: 'd',
	е: 'e',
	є: 'ie',
	ж: 'zh',
	з: 'z',
	и: 'y',
	і: 'i',
	ї: 'i',
	й: 'i',
	к: 'k',
	л: 'l',
	м: 'm',
	н: 'n',
	о: 'o',
	п: 'p',
	р: 'r',
	с: 's',
	т: 't',
	у: 'u',
	ф: 'f',
	х: 'kh',
	ц: 'ts',
	ч: 'ch',
	ш: 'sh',
	щ: 'shch',
	ь: '',
	ю: 'iu',
	я: 'ia',
	ы: 'y',
	э: 'e',
	ё: 'io',
	ъ: '',
};

/** A URL-safe slug from a name, for example `Світлана Петрівна` becomes `svitlana-petrivna`. */
export function slugify(name: string): string {
	return [...name.toLowerCase()]
		.map((char) => LETTERS[char] ?? char)
		.join('')
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.slice(0, 60)
		// trimmed after the cut, so a long name does not end with a dash
		.replace(/^-+|-+$/g, '');
}

/** The slugs the rules accept: lower case letters, digits and dashes, 2 to 60 characters. */
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,58}[a-z0-9]$/;

/**
 * The first slug that is not taken: `base`, then `base-2`, `base-3` and so on. The base is shortened so the
 * number still fits in the 60 characters the rules accept. `base` must match `SLUG_PATTERN`.
 */
export async function freeSlug(
	base: string,
	taken: (slug: string) => Promise<boolean>,
): Promise<string> {
	for (let n = 1; ; n++) {
		const suffix = n === 1 ? '' : `-${n}`;
		const slug = base.slice(0, 60 - suffix.length).replace(/-+$/, '') + suffix;

		if (!(await taken(slug))) return slug;
	}
}
