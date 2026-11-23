import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';

interface WeightRow {
	players: string;
	weight: number;
}

interface ExampleRow {
	student: string;
	app: string;
	place: string;
	share: string;
	weight: number;
	score: number;
}

interface TotalRow {
	name: string;
	text: string;
}

/**
 * How EduDB turns the ratings of very different apps into one ranking. The rules live here as content,
 * so the page and the API (server/edudb on it.webart.work) must be changed together.
 */
@Component({
	imports: [RouterLink, TranslateDirective],
	template: `
		<article class="directory-page">
			<p
				class="text-xs font-bold uppercase tracking-[0.08em] text-[var(--c-primary)]"
				translate
			>
				Ranking rules
			</p>
			<h1
				class="mt-2 text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)] sm:text-5xl"
				translate
			>
				How we calculate the ranking
			</h1>
			<p class="mt-4 max-w-[65ch] text-xl text-[var(--c-text-muted)]" translate>
				Chess, physics and cooking measure very different skills. These rules let us compare
				learners across all of them fairly.
			</p>
			<p
				class="mt-6 max-w-[65ch] rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-4 py-3 text-[var(--c-text)]"
				translate
			>
				The rankings still show sample players while we finish the platform. Once real results
				arrive, they follow exactly these rules.
			</p>

			<h2 class="page-section-title mb-3 text-2xl tracking-[-0.02em]" translate>
				Two numbers: app rating and EduDB score
			</h2>
			<ul class="max-w-[65ch] list-disc space-y-2 pl-5 text-[var(--c-text)]">
				<li translate>
					The app rating shows how strong you are inside one app. Every app has its own.
				</li>
				<li translate>
					The EduDB score compares you across apps. It is built from your place in each app,
					not from the rating numbers themselves.
				</li>
			</ul>

			<h2 class="page-section-title mb-3 text-2xl tracking-[-0.02em]" translate>
				1. The rating inside each app
			</h2>
			<ul class="max-w-[65ch] list-disc space-y-2 pl-5 text-[var(--c-text)]">
				<li translate>
					The developers of each app decide its rating formula, because they know their subject
					best. We put that formula on the EduDB server.
				</li>
				<li translate>
					Your rating is calculated only on the EduDB server. Nobody can change it from the
					browser, and the same rules apply to everyone.
				</li>
				<li translate>
					An app without its own formula uses the standard one: everyone starts at 1000, a
					correct answer raises the rating and a wrong one lowers it. A hard question gives
					more for a correct answer than an easy one.
				</li>
				<li translate>
					Only learning in the apps changes a rating. Teachers, schools and achievements never
					do.
				</li>
			</ul>

			<h2 class="page-section-title mb-3 text-2xl tracking-[-0.02em]" translate>
				2. Who counts in an app
			</h2>
			<ul class="max-w-[65ch] list-disc space-y-2 pl-5 text-[var(--c-text)]">
				<li translate>You have answered at least 30 questions in the app, so your rating has settled.</li>
				<li translate>You were active in the app during the last 90 days.</li>
				<li translate>The app has at least 10 such players. A smaller app does not give a score yet.</li>
			</ul>

			<h2 class="page-section-title mb-3 text-2xl tracking-[-0.02em]" translate>
				3. Your score in an app
			</h2>
			<p class="max-w-[65ch] text-[var(--c-text)]" translate>
				Your score in an app depends on two things: how many of its players you are ahead of,
				and how big the app is.
			</p>
			<p
				class="mt-5 inline-block rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-5 py-3 text-lg font-bold text-[var(--c-text-strong)]"
				translate
			>
				Score in an app = share × weight × 100
			</p>

			<h3 class="mt-8 text-lg font-bold text-[var(--c-text-strong)]" translate>Share</h3>
			<p class="mt-2 max-w-[65ch] text-[var(--c-text)]" translate>
				The share of the app's players you are ahead of. First place is 100%, the middle of the
				table is 50%, the last place is 0%.
			</p>

			<h3 class="mt-8 text-lg font-bold text-[var(--c-text-strong)]" translate>Weight</h3>
			<p class="mt-2 max-w-[65ch] text-[var(--c-text)]" translate>
				A bigger app counts more, because being ahead of 900 people is harder than being ahead
				of 90. The weight is the number of digits in the player count (exactly: the decimal
				logarithm of it).
			</p>
			<div
				class="mt-4 max-w-md overflow-x-auto rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)]"
			>
				<table class="w-full border-collapse text-sm tabular-nums">
					<thead>
						<tr class="text-xs uppercase tracking-wider text-[var(--c-text-muted)]">
							<th scope="col" class="px-4 py-2 text-left" translate>Players in the app</th>
							<th scope="col" class="px-4 py-2 text-right" translate>Weight</th>
						</tr>
					</thead>
					<tbody>
						@for (row of weights; track row.players) {
							<tr class="border-t border-[var(--c-border)]">
								<td class="px-4 py-2.5 text-[var(--c-text)]">{{ row.players }}</td>
								<td class="px-4 py-2.5 text-right font-bold text-[var(--c-text-strong)]">
									{{ row.weight }}
								</td>
							</tr>
						}
					</tbody>
				</table>
			</div>
			<p class="mt-4 max-w-[65ch] text-[var(--c-text)]" translate>
				The weight grows slowly on purpose. Ten times more players add only one step, so a big
				app counts more but never pushes out the smaller ones.
			</p>

			<h3 class="mt-8 text-lg font-bold text-[var(--c-text-strong)]" translate>Examples</h3>
			<div
				class="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)]"
			>
				<table class="w-full border-collapse text-sm tabular-nums">
					<thead>
						<tr class="text-xs uppercase tracking-wider text-[var(--c-text-muted)]">
							<th scope="col" class="px-4 py-2 text-left" translate>Student</th>
							<th scope="col" class="px-4 py-2 text-left" translate>App</th>
							<th scope="col" class="px-4 py-2 text-left" translate>Place</th>
							<th scope="col" class="px-4 py-2 text-right" translate>Share</th>
							<th scope="col" class="px-4 py-2 text-right" translate>Weight</th>
							<th scope="col" class="px-4 py-2 text-right" translate>Score</th>
						</tr>
					</thead>
					<tbody>
						@for (row of examples; track row.student) {
							<tr class="border-t border-[var(--c-border)]">
								<th
									scope="row"
									class="px-4 py-2.5 text-left font-semibold text-[var(--c-text-strong)]"
									[translate]="row.student"
								>
									{{ row.student }}
								</th>
								<td class="px-4 py-2.5 text-[var(--c-text)]" [translate]="row.app">
									{{ row.app }}
								</td>
								<td class="px-4 py-2.5 text-[var(--c-text)]" [translate]="row.place">
									{{ row.place }}
								</td>
								<td class="px-4 py-2.5 text-right text-[var(--c-text)]">{{ row.share }}</td>
								<td class="px-4 py-2.5 text-right text-[var(--c-text)]">{{ row.weight }}</td>
								<td class="px-4 py-2.5 text-right font-bold text-[var(--c-text-strong)]">
									{{ row.score }}
								</td>
							</tr>
						}
					</tbody>
				</table>
			</div>
			<p class="mt-4 max-w-[65ch] text-[var(--c-text)]" translate>
				The top 10% of an app with 1,000 players (270) rank above the top 10% of an app with 100
				players (180). Even first place in the smaller app (200) stays below them.
			</p>

			<h2 class="page-section-title mb-3 text-2xl tracking-[-0.02em]" translate>
				4. Category, overall and school rankings
			</h2>
			<dl class="grid max-w-[65ch] gap-4">
				@for (row of totals; track row.name) {
					<div
						class="rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-4 py-3"
					>
						<dt class="font-bold text-[var(--c-text-strong)]" [translate]="row.name">
							{{ row.name }}
						</dt>
						<dd class="mt-1 text-[var(--c-text)]" [translate]="row.text">{{ row.text }}</dd>
					</div>
				}
			</dl>

			<h2 class="page-section-title mb-3 text-2xl tracking-[-0.02em]" translate>
				5. Fair play
			</h2>
			<ul class="max-w-[65ch] list-disc space-y-2 pl-5 text-[var(--c-text)]">
				<li translate>Scores are recalculated every night from the ratings of all players.</li>
				<li translate>
					The server ignores repeated answers and too many answers in a short time.
				</li>
				<li translate>
					A person banned from a school by its director no longer counts in that school's
					ranking.
				</li>
				<li translate>
					Achievements from apps, teachers and schools appear on your profile. They never change
					a rating or a score.
				</li>
			</ul>

			<p class="mt-12">
				<a
					class="font-semibold text-[var(--c-primary)] underline underline-offset-4"
					routerLink="/rankings"
					translate
				>
					See the ranking
				</a>
			</p>
		</article>
	`,
})
export class RankingRulesComponent {
	protected readonly weights: WeightRow[] = [
		{ players: '10', weight: 1 },
		{ players: '100', weight: 2 },
		{ players: '1,000', weight: 3 },
		{ players: '10,000', weight: 4 },
	];

	protected readonly examples: ExampleRow[] = [
		{
			student: 'Anna',
			app: 'Chess, 1,000 players',
			place: 'top 10%',
			share: '90%',
			weight: 3,
			score: 270,
		},
		{
			student: 'Bohdan',
			app: 'Physics, 100 players',
			place: 'top 10%',
			share: '90%',
			weight: 2,
			score: 180,
		},
		{
			student: 'Daria',
			app: 'Physics, 100 players',
			place: '1st place',
			share: '100%',
			weight: 2,
			score: 200,
		},
		{
			student: 'Ivan',
			app: 'Chess, 1,000 players',
			place: 'middle',
			share: '50%',
			weight: 3,
			score: 150,
		},
	];

	protected readonly totals: TotalRow[] = [
		{
			name: 'Category score',
			text: 'The sum of your scores in the apps of that category.',
		},
		{
			name: 'Overall score',
			text: 'The sum of your scores in all apps. Being strong in several apps adds up.',
		},
		{
			name: 'School score',
			text: 'The average overall score of the school members who have one. A big school does not win just by its size.',
		},
		{
			name: 'This week',
			text: 'How much your overall score grew since last Monday.',
		},
	];
}
