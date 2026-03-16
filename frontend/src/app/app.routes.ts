import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { VenueDetails } from './pages/venue-details/venue-details';
import { Reservations } from './pages/reservations/reservations';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel';
import { NotFound } from './pages/not-found/not-found';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { VenuesComponent } from './pages/venues/venues';
import { VenuePanelComponent } from './pages/venue-panel/venue-panel';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [

        {
            path: '',
            component: Dashboard
        },
        {
            path: 'venues/:id',
            component: VenueDetails
        },
        {
            path: 'reservations',
            component: Reservations,
            canActivate: [authGuard]

        },
        {
            path: 'venues',
            component: VenuesComponent,

        },
        {
            path: 'venue-panel',
            component: VenuePanelComponent,
            canActivate: [authGuard, roleGuard(['venue_owner'])]

        },
        {
            path: 'admin-panel',
            component: AdminPanelComponent,
            canActivate: [authGuard, roleGuard(['admin'])]

        },
        {
            path: 'profile',
            component: Profile,
            canActivate: [authGuard, roleGuard(['user', 'venue_owner', 'admin'])]

        },
        {
            path: '**',
            component: NotFound
        }


];
