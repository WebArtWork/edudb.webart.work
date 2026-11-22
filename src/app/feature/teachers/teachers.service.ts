import { inject, Service, signal } from '@angular/core';
import type { Teacher } from '../edudb/edudb.data';
import { FirebaseService } from '../firebase/firebase.service';

/** The teachers (Firestore: edudb_teachers). Read once and kept; they only exist in the browser. */
@Service()
export class TeachersService {
	private readonly _firebase = inject(FirebaseService);

	readonly teachers = signal<Teacher[]>([]);
	/** `true` once the list was read (or could not be). */
	readonly loaded = signal(false);
	readonly failed = signal(false);

	private _loading: Promise<void> | null = null;

	load(): Promise<void> {
		this._loading ??= this._fetch();

		return this._loading;
	}

	reload(): Promise<void> {
		this._loading = null;

		return this.load();
	}

	private async _fetch(): Promise<void> {
		const db = await this._firebase.firestore();

		if (!db) return;

		try {
			const { collection, getDocs } = await import('firebase/firestore');
			const snapshot = await getDocs(collection(db, 'edudb_teachers'));

			this.teachers.set(
				snapshot.docs
					.map((item) => ({ ...(item.data() as Omit<Teacher, 'slug'>), slug: item.id }))
					.sort((a, b) => a.name.localeCompare(b.name)),
			);
			this.failed.set(false);
		} catch {
			this.failed.set(true);
		} finally {
			this.loaded.set(true);
		}
	}
}
