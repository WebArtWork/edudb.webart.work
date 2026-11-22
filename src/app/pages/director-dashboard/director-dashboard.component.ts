import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import type { Student } from '../../feature/edudb/edudb.models';
import { RoleService } from '../../feature/roles/role.service';
import { SchoolsService } from '../../feature/schools/schools.service';

/** The dashboard of the director of a school (behind `directorGuard`). More director pages go under /director. */
@Component({
	imports: [RouterLink, TranslateDirective],
	template: `
		<div class="directory-page">
			<p
				class="text-xs font-bold uppercase tracking-[0.08em] text-[var(--c-primary)]"
				translate
			>
				Director
			</p>
			<h1
				class="mt-2 text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--c-text-strong)] sm:text-5xl"
				translate
			>
				Director dashboard
			</h1>

			@if (school(); as school) {
				<p class="mt-4 max-w-[60ch] text-xl text-[var(--c-text-muted)]">
					{{ school.name }}, {{ school.city }}
				</p>
				<p class="mt-4">
					<a
						class="theme-interactive theme-focus inline-flex min-h-11 items-center rounded-full bg-[var(--c-primary)] px-5 text-sm font-semibold text-[var(--c-on-primary)]"
						routerLink="/schools"
						[fragment]="school.slug"
						translate
					>
						Open your school page
					</a>
				</p>

				<dl class="mb-6 mt-10 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
					<div
						class="rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-4 py-3.5"
					>
						<dt
							class="text-xs font-bold uppercase tracking-wider text-[var(--c-text-muted)]"
							translate
						>
							Students
						</dt>
						<dd class="mt-1 font-semibold text-[var(--c-text-strong)]">
							{{ students().length }}
						</dd>
					</div>
					<div
						class="rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-4 py-3.5"
					>
						<dt
							class="text-xs font-bold uppercase tracking-wider text-[var(--c-text-muted)]"
							translate
						>
							Total points
						</dt>
						<dd class="mt-1 font-semibold text-[var(--c-text-strong)]">
							{{ total() }}
						</dd>
					</div>
				</dl>

				@if (students().length) {
					<ul class="grid max-w-xl gap-2">
						@for (student of students(); track student.uid; let i = $index) {
							<li
								class="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] px-4 py-2.5"
							>
								<span class="font-semibold text-[var(--c-text-strong)]">
									{{ i + 1 }}. {{ student.displayName || '-' }}
								</span>
								<span class="tabular-nums text-[var(--c-text-muted)]">{{
									student.points
								}}</span>
							</li>
						}
					</ul>
				} @else if (studentsLoaded()) {
					<p class="text-[var(--c-text-muted)]" translate>
						No students yet. Students pick their school in their profile.
					</p>
				}

				<p class="mt-8 text-sm text-[var(--c-text-muted)]" translate>
					More director pages are coming soon.
				</p>
			} @else {
				<p class="mt-4 text-[var(--c-text-muted)]" translate>Loading...</p>
			}

			<p class="mt-10">
				<a class="theme-focus underline" routerLink="/profile" translate
					>Back to your profile</a
				>
			</p>
		</div>
	`,
})
export class DirectorDashboardComponent {
	private readonly _schools = inject(SchoolsService);
	protected readonly school = inject(RoleService).directorSchool;

	protected readonly students = signal<Student[]>([]);
	protected readonly studentsLoaded = signal(false);

	constructor() {
		void this._schools.load();

		effect(() => {
			const school = this.school();

			this.students.set([]);
			this.studentsLoaded.set(false);

			if (school) {
				void this._schools
					.students(school.slug)
					.then((list) => this.students.set(list))
					.catch(() => this.students.set([]))
					.finally(() => this.studentsLoaded.set(true));
			}
		});
	}

	protected total() {
		return this.students().reduce((sum, student) => sum + (student.points || 0), 0);
	}
}
