import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';

export interface TagLink {
	label: string;
	path: string;
	fragment?: string;
}

@Component({
	selector: 'app-tag-links',
	imports: [RouterLink, TranslateDirective],
	template: `
		<ul class="flex flex-wrap gap-2">
			@for (item of items(); track item.path + (item.fragment ?? '')) {
				<li>
					<a
						class="theme-interactive theme-focus inline-block rounded-full bg-[var(--c-bg-tertiary)] px-3 py-1 text-sm font-semibold text-[var(--c-text-strong)] hover:text-[var(--c-primary)]"
						[routerLink]="item.path"
						[fragment]="item.fragment"
						[translate]="item.label"
					>
						{{ item.label }}
					</a>
				</li>
			}
		</ul>
	`,
})
export class TagLinksComponent {
	readonly items = input.required<TagLink[]>();
}
