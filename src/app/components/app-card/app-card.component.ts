import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import type { EduApp } from '../../feature/edudb/edudb.data';
import { appPhoto } from '../../feature/edudb/edudb.media';

@Component({
	selector: 'app-app-card',
	imports: [NgOptimizedImage, RouterLink, TranslateDirective],
	template: `
		<a class="catalog-card theme-interactive theme-focus" [routerLink]="['/apps', app().slug]">
			<img class="catalog-card-photo" [ngSrc]="photo()" width="576" height="384" alt="" />
			<div class="catalog-card-body">
				<div class="catalog-card-heading">
					<h3 class="catalog-card-title" [translate]="app().name">{{ app().name }}</h3>
					<span class="catalog-card-arrow material-symbols-outlined" aria-hidden="true"
						>arrow_forward</span
					>
				</div>
				<p class="catalog-card-copy" [translate]="app().tagline">{{ app().tagline }}</p>
				<p class="catalog-card-meta" [translate]="app().platforms">{{ app().platforms }}</p>
			</div>
		</a>
	`,
})
export class AppCardComponent {
	readonly app = input.required<EduApp>();
	protected readonly photo = computed(() => appPhoto(this.app().slug));
}
