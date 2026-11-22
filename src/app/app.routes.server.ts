import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
	// Account pages require a browser session. Public pages render their shell and head at build time.
	{
		path: 'admin/access',
		renderMode: RenderMode.Client,
	},
	{
		path: 'admin/schools',
		renderMode: RenderMode.Client,
	},
	{
		path: 'admin/universities',
		renderMode: RenderMode.Client,
	},
	{
		path: 'director',
		renderMode: RenderMode.Client,
	},
	{
		path: 'teacher',
		renderMode: RenderMode.Client,
	},
	{
		path: 'onboarding',
		renderMode: RenderMode.Client,
	},
	{
		path: 'profile',
		renderMode: RenderMode.Client,
	},
	{
		path: '**',
		renderMode: RenderMode.Prerender,
	},
];
