import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { companyProfile } from '../../feature/company/company.data';

interface FooterPageLink {
	label: string;
	path: string;
}

@Component({
	selector: 'app-footer',
	imports: [RouterLink, TranslateDirective],
	templateUrl: './footer.component.html',
})
export class FooterComponent {
	protected readonly company = companyProfile;
	protected readonly currentYear = new Date().getFullYear();
	protected readonly pageLinks = computed<FooterPageLink[]>(() => [
		{ label: 'Categories', path: '/categories' },
		{ label: 'Teachers', path: '/teachers' },
		{ label: 'Schools', path: '/schools' },
		{ label: 'Apps', path: '/apps' },
		{ label: 'Ranking', path: '/rankings' },
		{ label: 'Profile', path: '/profile' },
	]);
}
