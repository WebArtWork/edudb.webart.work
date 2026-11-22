/** What a signed-in person can do on the site. */
export type Role = 'user' | 'teacher' | 'admin';

/** A school (Firestore: edudb_schools/{slug}, for example `kp-7`). */
export interface School {
	slug: string;
	name: string;
	city: string;
	description: string;
	/** The person who runs the school (an admin sets it). Missing when nobody does. */
	directorUid?: string;
}

/** A university (Firestore: edudb_universities/{slug}). An admin keeps the list. */
export interface University {
	slug: string;
	name: string;
	city: string;
}

/** How a place is shown in the lists: the city, then the name. */
export const placeLabel = (place: { city: string; name: string }): string =>
	place.city ? `${place.city} - ${place.name}` : place.name;

export type RequestStatus = 'pending' | 'approved' | 'ignored';

/** A request to become a teacher (Firestore: edudb_teacherRequests/{uid}). */
export interface TeacherRequest {
	uid: string;
	displayName: string;
	email: string;
	photoUrl: string;
	status: RequestStatus;
}

/** A signed-in person who chose a school (Firestore: edudb_users/{uid}). */
export interface Student {
	uid: string;
	displayName: string;
	photoUrl: string;
	schoolSlug: string;
	/** Written by the apps, never by the person (see the rules). */
	points: number;
}
