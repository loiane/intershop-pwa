import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { filter } from 'rxjs/operators';
import { Category } from '../../../models/category/category.model';
import { Product } from '../../../models/product/product.model';
import { ViewType } from '../../../models/types';
import * as fromStore from '../../store/categories';

@Component({
  selector: 'ish-category-page-container',
  templateUrl: './category-page.container.html'
})

export class CategoryPageContainerComponent implements OnInit {

  category$: Observable<Category>;
  categoryLoading$: Observable<boolean>;
  categoryPath$: Observable<Category[]> = of([]); // TODO: only category should be needed once the REST call returns the categoryPath as part of the category
  products$: Observable<Product[]>;
  totalItems$: Observable<number>;
  // TODO: get viewType and sortBy from Store
  viewType: ViewType = 'grid';
  sortBy = 'default';


  constructor(
    private store: Store<fromStore.ShoppingState>
  ) { }

  ngOnInit() {
    // TODO: find a nicer way to filter out the case of an 'undefined' category
    this.category$ = this.store.select(fromStore.getSelectedCategory).pipe(filter(e => !!e));
    this.categoryLoading$ = this.store.select(fromStore.getCategoryLoading);
    // TODO: only category should be needed once the REST call returns the categoryPath as part of the category
    this.categoryPath$ = this.store.select(fromStore.getSelectedCategoryPath);

    this.products$ = this.store.select(fromStore.getProductsForSelectedCategory);
    this.totalItems$ = this.store.select(fromStore.getProductCountForSelectedCategory);
  }

  changeViewType(viewType: ViewType) {
    this.viewType = viewType;
    // TODO: Dispatch action
    console.log('ViewType changed to', viewType);
  }

  changeSortBy(sortBy: string) {
    this.sortBy = sortBy;
    // TODO: Dispatch action
    console.log('SortBy changed to', sortBy);
  }
}