import { Component, computed, inject, input } from '@angular/core';
import { TranslateDirective, TranslateService } from '@wawjs/ngx-translate';
import { apps } from '../../feature/edudb/edudb.data';
import { hueOf } from '../../feature/edudb/edudb.queries';
import { buildRanking } from '../../feature/edudb/ranking.data';

@Component({
	selector: 'app-rank-table',
	imports: [TranslateDirective],
	templateUrl: './rank-table.component.html',
})
export class RankTableComponent {
	private readonly _translateService = inject(TranslateService);

	/** The apps whose points are added up in this table. */
	readonly appSlugs = input.required<string[]>();
	/** The caption text; it may contain `{{name}}`, which is replaced by the translated `captionName`. */
	readonly caption = input.required<string>();
	readonly captionName = input('');
	readonly limit = input(10);
	/** Show one column per app (used on category pages with more than one app). */
	readonly columns = input(false);

	protected readonly rows = computed(() => buildRanking(this.appSlugs(), this.limit()));
	protected readonly showColumns = computed(() => this.columns() && this.appSlugs().length > 1);
	protected readonly showPlayed = computed(() => !this.columns() && this.appSlugs().length > 1);
	protected readonly appNames = computed(() =>
		this.appSlugs().map((slug) => apps.find((app) => app.slug === slug)?.name ?? slug),
	);
	protected readonly captionVars = computed(() => ({
		name: this.captionName() ? this._translateService.translate(this.captionName())() : '',
	}));

	protected hue(player: string) {
		return hueOf(player);
	}
}
