/**
 * Sample ranking data. The points are made up and stable: they are derived from the player name and
 * the app, so every build shows the same table. Real points will come from the apps later.
 */
export interface RankRow {
	player: string;
	/** Points per app, in the order of the slugs that were asked for. */
	perApp: number[];
	appsPlayed: number;
	total: number;
}

const players = [
	'nova_k',
	'mathfox',
	'bytebea',
	'quietrook',
	'sol_ivan',
	'pixelpine',
	'lena.t',
	'orbit77',
	'chefmarta',
	'tomek_dev',
	'ada_w',
	'greenfern',
	'kuro',
	'hana_b',
	'milo_r',
	'zoya',
];

function seed(value: string): number {
	return [...value].reduce((total, char) => (total * 131 + char.charCodeAt(0)) % 100003, 17);
}

function points(player: string, appSlug: string): number {
	const hash = seed(`${player}:${appSlug}`);

	return hash % 4 === 0 ? 0 : 120 + (hash % 880);
}

/** Players ranked by their points in the given apps (best first). Players with no points are left out. */
export function buildRanking(appSlugs: string[], limit = 10): RankRow[] {
	return players
		.map((player) => {
			const perApp = appSlugs.map((slug) => points(player, slug));

			return {
				player,
				perApp,
				appsPlayed: perApp.filter(Boolean).length,
				total: perApp.reduce((sum, value) => sum + value, 0),
			};
		})
		.filter((row) => row.total > 0)
		.sort((a, b) => b.total - a.total || a.player.localeCompare(b.player))
		.slice(0, limit);
}
