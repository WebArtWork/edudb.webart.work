import { inject, Service, signal } from '@angular/core';
import type { Teacher } from '../edudb/edudb.data';
import type { TeacherRequest } from '../edudb/edudb.models';
import { freeSlug, SLUG_PATTERN, slugify } from '../edudb/slug';
import { FirebaseService } from '../firebase/firebase.service';
import { TeachersService } from '../teachers/teachers.service';

/** Admin: the teacher requests, and approving or ignoring them. */
@Service()
export class AccessService {
	private readonly _firebase = inject(FirebaseService);
	private readonly _teachers = inject(TeachersService);

	readonly requests = signal<TeacherRequest[]>([]);
	readonly loaded = signal(false);
	readonly failed = signal(false);

	async load(): Promise<void> {
		const db = await this._firebase.firestore();

		if (!db) return;

		try {
			const { collection, getDocs } = await import('firebase/firestore');
			const snapshot = await getDocs(collection(db, 'edudb_teacherRequests'));
			const order = { pending: 0, approved: 1, ignored: 2 };

			this.requests.set(
				snapshot.docs
					.map((item) => ({
						...(item.data() as Omit<TeacherRequest, 'uid'>),
						uid: item.id,
					}))
					.sort(
						(a, b) =>
							order[a.status] - order[b.status] ||
							a.displayName.localeCompare(b.displayName),
					),
			);
			this.failed.set(false);
		} catch {
			this.failed.set(true);
		} finally {
			this.loaded.set(true);
		}
	}

	/** Approves the request: the person becomes a teacher and gets a page at /teachers#<slug>. */
	async approve(request: TeacherRequest): Promise<void> {
		const db = await this._firebase.firestore();

		if (!db) return;

		const { doc, getDoc, serverTimestamp, writeBatch } = await import('firebase/firestore');
		const name = slugify(request.displayName || request.email.split('@')[0]);
		// a name of one letter, or of no Latin or Cyrillic letters at all, gives no slug the rules accept
		const base = SLUG_PATTERN.test(name)
			? name
			: `teacher-${slugify(request.uid).slice(0, 6) || 'new'}`;
		const slug = await freeSlug(base, async (candidate) =>
			(await getDoc(doc(db, 'edudb_teachers', candidate))).exists(),
		);

		const teacher: Omit<Teacher, 'slug'> = {
			uid: request.uid,
			name: request.displayName || request.email,
			role: 'Teacher',
			subject: '',
			short: '',
			bio: '',
			topics: [],
			apps: [],
			categories: [],
			photoUrl: request.photoUrl,
		};
		const batch = writeBatch(db);

		batch.set(doc(db, 'edudb_teachers', slug), {
			...teacher,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});
		batch.update(doc(db, 'edudb_teacherRequests', request.uid), {
			status: 'approved',
			updatedAt: serverTimestamp(),
		});
		await batch.commit();
		await Promise.all([this.load(), this._teachers.reload()]);
	}

	/** Ignores the request; the person stays a user. */
	async ignore(request: TeacherRequest): Promise<void> {
		const db = await this._firebase.firestore();

		if (!db) return;

		const { doc, serverTimestamp, updateDoc } = await import('firebase/firestore');

		await updateDoc(doc(db, 'edudb_teacherRequests', request.uid), {
			status: 'ignored',
			updatedAt: serverTimestamp(),
		});
		await this.load();
	}
}
