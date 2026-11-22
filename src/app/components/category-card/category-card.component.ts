import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { subjectPhoto } from '../../feature/edudb/edudb.media';
import type { Category } from '../../feature/edudb/edudb.data';
import { appsOfCategory, teachersOfCategory } from '../../feature/edudb/edudb.queries';
import { TeachersService } from '../../feature/teachers/teachers.service';

@Component({
	selector: 'app-category-card',
	imports: [NgOptimizedImage, RouterLink, TranslateDirective],
	template: `
		<a
			class="catalog-card theme-interactive theme-focus"
			[routerLink]="['/categories', category().slug]"
		>
			<img class="catalog-card-photo" [ngSrc]="photo()" width="576" height="384" alt="" />
			<div class="catalog-card-body">
				<div class="catalog-card-heading">
					<h3 class="catalog-card-title" [translate]="category().name">
						{{ category().name }}
					</h3>
					<span class="catalog-card-arrow material-symbols-outlined" aria-hidden="true"
						>arrow_forward</span
					>
				</div>
				<p class="catalog-card-copy" [translate]="category().tagline">
					{{ category().tagline }}
				</p>
				<p class="catalog-card-meta">
					@if (appCount() || teacherCount()) {
						@if (appCount()) {
							<span [translate]="'Apps: {{count}}'" [vars]="{ count: appCount() }">
								Apps: {{ appCount() }}
							</span>
						}
						@if (teacherCount()) {
							<span
								[translate]="'Teachers: {{count}}'"
								[vars]="{ count: teacherCount() }"
							>
								Teachers: {{ teacherCount() }}
							</span>
						}
					} @else {
						<span translate>Coming soon</span>
					}
				</p>
			</div>
		</a>
	`,
})
export class CategoryCardComponent {
	readonly category = input.required<Category>();
	protected readonly photo = computed(() => subjectPhoto(this.category().slug));

	protected readonly appCount = computed(() => appsOfCategory(this.category()).length);
	private readonly _teachers = inject(TeachersService);
	protected readonly teacherCount = computed(
		() => teachersOfCategory(this._teachers.teachers(), this.category()).length,
	);

	constructor() {
		void this._teachers.load();
	}
}
