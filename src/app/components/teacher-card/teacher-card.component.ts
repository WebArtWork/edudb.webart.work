import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Teacher } from '../../feature/edudb/edudb.data';
import { hueOf, initials } from '../../feature/edudb/edudb.queries';

@Component({
	selector: 'app-teacher-card',
	imports: [RouterLink],
	template: `
		<a
			class="theme-interactive theme-focus flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] p-5 hover:border-[var(--c-primary)]"
			routerLink="/teachers"
			[fragment]="teacher().slug"
		>
			<div class="flex items-center gap-3">
				@if (photo()) {
					<img
						class="h-12 w-12 flex-none rounded-full"
						[src]="photo()"
						alt=""
						width="48"
						height="48"
						referrerpolicy="no-referrer"
					/>
				} @else {
					<span
						class="grid h-12 w-12 flex-none place-items-center rounded-full text-base font-bold text-white"
						[style.background]="'hsl(' + hue() + ' 55% 38%)'"
						aria-hidden="true"
					>
						{{ initials() }}
					</span>
				}
				<div>
					<h3 class="text-base font-semibold text-[var(--c-text-strong)]">
						{{ teacher().name }}
					</h3>
					<p class="text-sm text-[var(--c-text-muted)]">{{ teacher().role }}</p>
				</div>
			</div>
			@if (teacher().short) {
				<p class="text-sm leading-6 text-[var(--c-text)]">{{ teacher().short }}</p>
			}
		</a>
	`,
})
export class TeacherCardComponent {
	readonly teacher = input.required<Teacher>();

	protected photo() {
		const url = this.teacher().photoUrl;

		return url.startsWith('https://') ? url : '';
	}

	protected hue() {
		return hueOf(this.teacher().slug);
	}

	protected initials() {
		return initials(this.teacher().name);
	}
}
