import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from '../profile/profile.service';
import { RoleService } from '../roles/role.service';
import { SchoolsService } from '../schools/schools.service';
import { AuthService } from './auth.service';

// Everything is injected before the first `await`: after it there is no injection context any more.

/** The profile is for signed-in users: anyone else goes to the sign-in page. */
export const authGuard: CanActivateFn = async () => {
	const auth = inject(AuthService);
	const router = inject(Router);
	const user = await auth.whenReady();

	return user ? true : router.parseUrl('/sign');
};

/** The sign-in page: someone who is already signed in goes straight to the profile. */
export const guestGuard: CanActivateFn = async () => {
	const auth = inject(AuthService);
	const router = inject(Router);
	const user = await auth.whenReady();

	return user ? router.parseUrl('/profile') : true;
};

/** Admin pages (Access, admin/schools). Everyone else goes to the profile, or to sign in. */
export const adminGuard: CanActivateFn = async () => {
	const auth = inject(AuthService);
	const roles = inject(RoleService);
	const router = inject(Router);
	const user = await auth.whenReady();

	if (!user) return router.parseUrl('/sign');

	return roles.isAdmin(user) ? true : router.parseUrl('/profile');
};

/** Everything under /teacher is for approved teachers. Everyone else goes to the profile, or to sign in. */
export const teacherGuard: CanActivateFn = async () => {
	const auth = inject(AuthService);
	const roles = inject(RoleService);
	const router = inject(Router);
	const user = await auth.whenReady();

	if (!user) return router.parseUrl('/sign');

	// the teacher role comes from the person's approved request
	await roles.loadRequest();

	return roles.role() === 'teacher' ? true : router.parseUrl('/profile');
};

/** Everything under /director is for the director of a school. Everyone else goes to the profile, or to sign in. */
export const directorGuard: CanActivateFn = async () => {
	const auth = inject(AuthService);
	const roles = inject(RoleService);
	const schools = inject(SchoolsService);
	const router = inject(Router);
	const user = await auth.whenReady();

	if (!user) return router.parseUrl('/sign');

	// the director is named on the school, so the schools have to be read first
	await schools.load();

	return roles.directorSchool() ? true : router.parseUrl('/profile');
};

/** The profile opens only after the onboarding is done; until then the person goes to the onboarding. */
export const onboardedGuard: CanActivateFn = async () => {
	const profiles = inject(ProfileService);
	const router = inject(Router);
	const profile = await profiles.whenLoaded();

	return profile?.onboarded ? true : router.parseUrl('/onboarding');
};

/** The onboarding is shown once: someone who finished it goes to the profile. */
export const notOnboardedGuard: CanActivateFn = async () => {
	const profiles = inject(ProfileService);
	const router = inject(Router);
	const profile = await profiles.whenLoaded();

	return profile?.onboarded ? router.parseUrl('/profile') : true;
};
