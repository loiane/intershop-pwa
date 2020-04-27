import { Inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Store, select } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import {
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  mergeMap,
  switchMap,
  switchMapTo,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { MAIN_NAVIGATION_MAX_SUB_CATEGORIES_DEPTH } from 'ish-core/configurations/injection-keys';
import { CategoryHelper } from 'ish-core/models/category/category.model';
import { ofCategoryUrl } from 'ish-core/routing/category/category.route';
import { CategoriesService } from 'ish-core/services/categories/categories.service';
import { selectRouteParam } from 'ish-core/store/router';
import { loadMoreProducts } from 'ish-core/store/shopping/product-listing';
import { HttpStatusCodeService } from 'ish-core/utils/http-status-code/http-status-code.service';
import {
  mapErrorToActionV8,
  mapToPayloadProperty,
  mapToProperty,
  whenFalsy,
  whenTruthy,
} from 'ish-core/utils/operators';

import {
  loadCategory,
  loadCategoryFail,
  loadCategorySuccess,
  loadTopLevelCategories,
  loadTopLevelCategoriesFail,
  loadTopLevelCategoriesSuccess,
} from './categories.actions';
import { getCategoryEntities, getSelectedCategory, isTopLevelCategoriesLoaded } from './categories.selectors';

@Injectable()
export class CategoriesEffects {
  constructor(
    private actions$: Actions,
    private store: Store<{}>,
    private categoryService: CategoriesService,
    @Inject(MAIN_NAVIGATION_MAX_SUB_CATEGORIES_DEPTH) private mainNavigationMaxSubCategoriesDepth: number,
    private httpStatusCodeService: HttpStatusCodeService
  ) {}

  selectedCategory$ = createEffect(() =>
    this.store.pipe(
      select(selectRouteParam('categoryUniqueId')),
      whenTruthy(),
      withLatestFrom(this.store.pipe(select(getCategoryEntities))),
      filter(([id, entities]) => !CategoryHelper.isCategoryCompletelyLoaded(entities[id])),
      map(([categoryId]) => loadCategory({ payload: { categoryId } }))
    )
  );
  loadCategoriesOfCategoryPath$ = createEffect(() =>
    this.store.pipe(
      select(getSelectedCategory),
      filter(CategoryHelper.isCategoryCompletelyLoaded),
      mapToProperty('categoryPath'),
      withLatestFrom(this.store.pipe(select(getCategoryEntities))),
      map(([ids, entities]) => ids.filter(id => !CategoryHelper.isCategoryCompletelyLoaded(entities[id]))),
      mergeMap(ids => ids.map(categoryId => loadCategory({ payload: { categoryId } })))
    )
  );
  loadCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCategory),
      mapToPayloadProperty('categoryId'),
      mergeMap(categoryUniqueId =>
        this.categoryService.getCategory(categoryUniqueId).pipe(
          map(categories => loadCategorySuccess({ payload: { categories } })),
          mapErrorToActionV8(loadCategoryFail)
        )
      )
    )
  );
  loadTopLevelWhenUnavailable$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction),
      switchMapTo(this.store.pipe(select(isTopLevelCategoriesLoaded))),
      whenFalsy(),
      mapTo(loadTopLevelCategories({ payload: { depth: this.mainNavigationMaxSubCategoriesDepth } }))
    )
  );
  loadTopLevelCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTopLevelCategories),
      mapToPayloadProperty('depth'),
      switchMap(limit =>
        this.categoryService.getTopLevelCategories(limit).pipe(
          map(categories => loadTopLevelCategoriesSuccess({ payload: { categories } })),
          mapErrorToActionV8(loadTopLevelCategoriesFail)
        )
      )
    )
  );
  productOrCategoryChanged$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction),
      switchMapTo(
        this.store.pipe(
          ofCategoryUrl(),
          select(getSelectedCategory),
          whenTruthy(),
          filter(cat => cat.hasOnlineProducts),
          map(({ uniqueId }) => loadMoreProducts({ payload: { id: { type: 'category', value: uniqueId } } }))
        )
      ),
      distinctUntilChanged(isEqual)
    )
  );
  redirectIfErrorInCategories$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loadCategoryFail),
        tap(() => this.httpStatusCodeService.setStatusAndRedirect(404))
      ),
    { dispatch: false }
  );
}
