import { NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { ActionReducerMap, MetaReducer, StoreModule } from '@ngrx/store';

import { configurationMeta } from 'ish-core/configurations/configuration.meta';
import { ngrxStateTransferMeta } from 'ish-core/configurations/ngrx-state-transfer';
import { ConfigurationGuard } from 'ish-core/guards/configuration.guard';
import { addGlobalGuard } from 'ish-core/utils/routing';

import { environment } from '../../../environments/environment';

import { AddressesEffects } from './addresses/addresses.effects';
import { addressesReducer } from './addresses/addresses.reducer';
import { CheckoutStoreModule } from './checkout/checkout-store.module';
import { ConfigurationEffects } from './configuration/configuration.effects';
import { configurationReducer } from './configuration/configuration.reducer';
import { ContentStoreModule } from './content/content-store.module';
import { CoreState } from './core-store';
import { CountriesEffects } from './countries/countries.effects';
import { countriesReducer } from './countries/countries.reducer';
import { ErrorEffects } from './error/error.effects';
import { errorReducer } from './error/error.reducer';
import { HybridStoreModule } from './hybrid/hybrid-store.module';
import { MessagesEffects } from './messages/messages.effects';
import { OrdersEffects } from './orders/orders.effects';
import { ordersReducer } from './orders/orders.reducer';
import { RegionsEffects } from './regions/regions.effects';
import { regionsReducer } from './regions/regions.reducer';
import { RestoreStoreModule } from './restore/restore-store.module';
import { CustomRouterSerializer } from './router/router.serializer';
import { ShoppingStoreModule } from './shopping/shopping-store.module';
import { UserEffects } from './user/user.effects';
import { userReducer } from './user/user.reducer';
import { ViewconfEffects } from './viewconf/viewconf.effects';
import { viewconfReducer } from './viewconf/viewconf.reducer';

export const coreReducers: ActionReducerMap<CoreState> = {
  router: routerReducer,
  user: userReducer,
  addresses: addressesReducer,
  orders: ordersReducer,
  countries: countriesReducer,
  regions: regionsReducer,
  error: errorReducer,
  viewconf: viewconfReducer,
  configuration: configurationReducer,
};

export const coreEffects = [
  UserEffects,
  AddressesEffects,
  OrdersEffects,
  CountriesEffects,
  ErrorEffects,
  RegionsEffects,
  ViewconfEffects,
  ConfigurationEffects,
  MessagesEffects,
];

// tslint:disable-next-line: no-any
const metaReducers: MetaReducer<any>[] = [ngrxStateTransferMeta, configurationMeta];

@NgModule({
  imports: [
    // tslint:disable-next-line: ng-module-sorted-fields
    StoreModule.forRoot(coreReducers, {
      metaReducers,
      runtimeChecks: {
        strictActionImmutability: !environment.production,
        strictActionSerializability: !environment.production,
        strictStateImmutability: !environment.production,
        strictStateSerializability: !environment.production,
      },
    }),
    StoreRouterConnectingModule.forRoot({ serializer: CustomRouterSerializer }),
    EffectsModule.forRoot(coreEffects),
    CheckoutStoreModule,
    ContentStoreModule,
    HybridStoreModule,
    RestoreStoreModule,
    ShoppingStoreModule,
  ],
})
export class CoreStoreModule {
  constructor(router: Router) {
    addGlobalGuard(router, ConfigurationGuard);
  }
}
