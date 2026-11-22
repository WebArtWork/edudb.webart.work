import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { AppCardComponent } from '../../components/app-card/app-card.component';
import { CategoryCardComponent } from '../../components/category-card/category-card.component';
import { RankTableComponent } from '../../components/rank-table/rank-table.component';
import { TeacherCardComponent } from '../../components/teacher-card/teacher-card.component';
import { apps } from '../../feature/edudb/edudb.data';
import { categoriesByGroup, categoryGroups } from '../../feature/edudb/edudb.queries';
import { TeachersService } from '../../feature/teachers/teachers.service';

@Component({
	imports: [
		AppCardComponent,
		CategoryCardComponent,
		NgOptimizedImage,
		RankTableComponent,
		RouterLink,
		TranslateDirective,
		TeacherCardComponent,
	],
	templateUrl: './landing.component.html',
})
export class LandingComponent {
	protected readonly groups = (['school', 'work'] as const).map((key) => ({
		label: categoryGroups[key],
		categories: categoriesByGroup(key),
	}));
	protected readonly teachers = inject(TeachersService);
	protected readonly featuredTeachers = computed(() => this.teachers.teachers().slice(0, 3));
	protected readonly featuredApps = apps.slice(0, 3);
	protected readonly allAppSlugs = apps.map((app) => app.slug);

	constructor() {
		void this.teachers.load();
	}
}
