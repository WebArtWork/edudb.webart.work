import { Routes } from '@angular/router';
import { buildAbsoluteUrl, buildRouteMeta } from '@wawjs/ngx-default';
import { apps, categories } from './feature/edudb/edudb.data';
import {
	adminGuard,
	authGuard,
	directorGuard,
	guestGuard,
	notOnboardedGuard,
	onboardedGuard,
	teacherGuard,
} from './feature/auth/auth.guard';
import { companyProfile } from './feature/company/company.data';

function publicRouteMeta(path: string) {
	const filename = path.slice(1).replaceAll('/', '-') || 'home';

	return {
		...buildRouteMeta(companyProfile, path),
		image: buildAbsoluteUrl(companyProfile.siteUrl, '/social/' + filename + '.jpg'),
	};
}

const notFoundRoute = {
	data: {
		meta: {
			...publicRouteMeta('/404'),
			title: 'Page not found',
			robots: 'noindex, nofollow',
		},
	},
	loadComponent: () =>
		import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
};

/** Route metadata for a page: a clean title and description, with its own preview image. */
const page = (path: string, title: string, description: string, slug?: string) => ({
	slug,
	meta: { ...publicRouteMeta(path), title, description },
});

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		data: {
			meta: {
				...publicRouteMeta('/'),
				titleSuffix: '',
			},
		},
		loadComponent: () =>
			import('./pages/landing/landing.component').then((m) => m.LandingComponent),
	},

	{
		path: 'categories',
		pathMatch: 'full',
		data: page(
			'/categories',
			'Categories',
			'Browse apps and teachers by school subject or field of work.',
		),
		loadComponent: () =>
			import('./pages/categories/categories.component').then((m) => m.CategoriesComponent),
	},
	// One prerendered page per category.
	...categories.map((category) => ({
		path: `categories/${category.slug}`,
		data: page(
			`/categories/${category.slug}`,
			category.name,
			`${category.tagline} Apps, teachers and ranking.`,
			category.slug,
		),
		loadComponent: () =>
			import('./pages/category/category.component').then((m) => m.CategoryComponent),
	})),

	{
		path: 'teachers',
		pathMatch: 'full',
		data: page('/teachers', 'Teachers', 'Browse teachers, mentors and coaches by subject.'),
		loadComponent: () =>
			import('./pages/teachers/teachers.component').then((m) => m.TeachersComponent),
	},
	{
		path: 'schools',
		pathMatch: 'full',
		data: page(
			'/schools',
			'Schools',
			'Explore schools on EduDB and see how students rank by points.',
		),
		loadComponent: () =>
			import('./pages/schools/schools.component').then((m) => m.SchoolsComponent),
	},
	{
		path: 'apps',
		pathMatch: 'full',
		data: page('/apps', 'Apps', 'Browse education apps for school subjects and for work.'),
		loadComponent: () => import('./pages/apps/apps.component').then((m) => m.AppsComponent),
	},
	...apps.map((app) => ({
		path: `apps/${app.slug}`,
		data: page(`/apps/${app.slug}`, app.name, app.tagline, app.slug),
		loadComponent: () =>
			import('./pages/app-detail/app-detail.component').then((m) => m.AppDetailComponent),
	})),

	{
		path: 'rankings',
		data: page(
			'/rankings',
			'Ranking',
			'The overall EduDB player ranking, plus the ranking of every category and app.',
		),
		loadComponent: () =>
			import('./pages/rankings/rankings.component').then((m) => m.RankingsComponent),
	},
	{
		path: 'ranking-rules',
		data: {
			meta: {
				...page(
					'/ranking-rules',
					'Ranking rules',
					'How EduDB compares learners across very different apps: app ratings, share of players and app size.',
				).meta,
				// shares the ranking preview image
				image: buildAbsoluteUrl(companyProfile.siteUrl, '/social/rankings.jpg'),
			},
		},
		loadComponent: () =>
			import('./pages/ranking-rules/ranking-rules.component').then(
				(m) => m.RankingRulesComponent,
			),
	},
	{
		path: 'admin/access',
		canActivate: [adminGuard],
		data: {
			meta: {
				...buildRouteMeta(companyProfile, '/admin/access'),
				title: 'Access',
				robots: 'noindex, nofollow',
			},
		},
		loadComponent: () =>
			import('./pages/admin-access/admin-access.component').then(
				(m) => m.AdminAccessComponent,
			),
	},
	{
		path: 'admin/schools',
		canActivate: [adminGuard],
		data: {
			meta: {
				...buildRouteMeta(companyProfile, '/admin/schools'),
				title: 'Manage schools',
				robots: 'noindex, nofollow',
			},
		},
		loadComponent: () =>
			import('./pages/admin-schools/admin-schools.component').then(
				(m) => m.AdminSchoolsComponent,
			),
	},
	{
		path: 'admin/universities',
		canActivate: [adminGuard],
		data: {
			meta: {
				...buildRouteMeta(companyProfile, '/admin/universities'),
				title: 'Manage universities',
				robots: 'noindex, nofollow',
			},
		},
		loadComponent: () =>
			import('./pages/admin-universities/admin-universities.component').then(
				(m) => m.AdminUniversitiesComponent,
			),
	},
	{
		// the school director role: everything under /director
		path: 'director',
		canActivate: [directorGuard],
		data: {
			meta: {
				...buildRouteMeta(companyProfile, '/director'),
				title: 'Director dashboard',
				robots: 'noindex, nofollow',
			},
		},
		loadComponent: () =>
			import('./pages/director-dashboard/director-dashboard.component').then(
				(m) => m.DirectorDashboardComponent,
			),
	},
	{
		// the teacher role: everything under /teacher (the public list is /teachers)
		path: 'teacher',
		canActivate: [teacherGuard],
		data: {
			meta: {
				...buildRouteMeta(companyProfile, '/teacher'),
				title: 'Teacher dashboard',
				robots: 'noindex, nofollow',
			},
		},
		loadComponent: () =>
			import('./pages/teacher-dashboard/teacher-dashboard.component').then(
				(m) => m.TeacherDashboardComponent,
			),
	},
	{
		path: 'sign',
		canActivate: [guestGuard],
		data: {
			meta: {
				...publicRouteMeta('/sign'),
				title: 'Sign in',
				description: 'Sign in to EduDB with your Google account.',
				robots: 'noindex, nofollow',
			},
		},
		loadComponent: () => import('./pages/sign/sign.component').then((m) => m.SignComponent),
	},
	{
		path: 'onboarding',
		canActivate: [authGuard, notOnboardedGuard],
		data: {
			meta: {
				...buildRouteMeta(companyProfile, '/onboarding'),
				title: 'Welcome',
				description: 'Tell us a bit about yourself.',
				robots: 'noindex, nofollow',
			},
		},
		loadComponent: () =>
			import('./pages/onboarding/onboarding.component').then((m) => m.OnboardingComponent),
	},
	{
		path: 'profile',
		canActivate: [authGuard, onboardedGuard],
		data: {
			meta: {
				...buildRouteMeta(companyProfile, '/profile'),
				title: 'Your profile',
				description: 'Your EduDB profile: account, points and ranking.',
				robots: 'noindex, nofollow',
			},
		},
		loadComponent: () =>
			import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
	},

	// Prerendered to 404/index.html; the deploy workflow publishes it as 404.html for GitHub Pages.
	{ path: '404', ...notFoundRoute },
	// Unknown URLs reached inside the app (for example a broken link) show the same page.
	{ path: '**', ...notFoundRoute },
];
