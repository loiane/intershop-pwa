import { HttpError } from 'ish-core/models/http-error/http-error.model';
import { Product } from 'ish-core/models/product/product.model';

import {
  loadProduct,
  loadProductBundlesSuccess,
  loadProductFail,
  loadProductIfNotLoaded,
  loadProductLinks,
  loadProductLinksFail,
  loadProductLinksSuccess,
  loadProductSuccess,
  loadProductVariations,
  loadProductVariationsFail,
  loadProductVariationsSuccess,
  loadProductsForCategory,
  loadProductsForCategoryFail,
  loadRetailSetSuccess,
} from './products.actions';
import { ProductsState, initialState, productsReducer } from './products.reducer';

describe('Products Reducer', () => {
  describe('undefined action', () => {
    it('should return the default state when previous state is undefined', () => {
      const action = {} as ReturnType<
        | typeof loadProduct
        | typeof loadProductBundlesSuccess
        | typeof loadProductFail
        | typeof loadProductIfNotLoaded
        | typeof loadProductSuccess
        | typeof loadProductsForCategory
        | typeof loadProductsForCategoryFail
        | typeof loadProductVariations
        | typeof loadProductVariationsFail
        | typeof loadProductVariationsSuccess
        | typeof loadRetailSetSuccess
        | typeof loadProductLinks
        | typeof loadProductLinksFail
        | typeof loadProductLinksSuccess
      >;
      const state = productsReducer(undefined, action);

      expect(state).toBe(initialState);
    });
  });

  describe('LoadProduct actions', () => {
    describe('LoadProduct action', () => {
      it('should set loading to true', () => {
        const action = loadProduct({ payload: { sku: '123' } });
        const state = productsReducer(initialState, action);

        expect(state.loading).toBeTrue();
        expect(state.entities).toBeEmpty();
      });
    });

    describe('LoadCategoryFail action', () => {
      let state: ProductsState;

      beforeEach(() => {
        const action = loadProductFail({ payload: { error: {} as HttpError, sku: 'invalid' } });
        state = productsReducer(initialState, action);
      });

      it('should set loading to false and add product to failed list', () => {
        expect(state.loading).toBeFalse();
        expect(state.entities).toBeEmpty();
        expect(state.failed).toIncludeAllMembers(['invalid']);
      });

      describe('followed by LoadProductSuccess', () => {
        beforeEach(() => {
          const product = { sku: 'invalid' } as Product;
          const action = loadProductSuccess({ payload: { product } });
          state = productsReducer(initialState, action);
        });

        it('should set loading to false and remove product from failed list', () => {
          expect(state.loading).toBeFalse();
          expect(state.entities).toHaveProperty('invalid');
          expect(state.failed).toBeEmpty();
        });
      });
    });

    describe('LoadProductSuccess action', () => {
      let product: Product;

      beforeEach(() => {
        product = {
          sku: '111',
          name: 'Test product',
          inStock: true,
          completenessLevel: 2,
          longDescription: 'some description',
        } as Product;
      });

      it('should insert product if not exists', () => {
        const action = loadProductSuccess({ payload: { product } });
        const state = productsReducer(initialState, action);

        expect(state.ids).toHaveLength(1);
        expect(state.entities[product.sku]).toEqual(product);
      });

      it('should merge product updates when new info is available', () => {
        const action1 = loadProductSuccess({ payload: { product } });
        const state1 = productsReducer(initialState, action1);

        const updatedProduct = {
          sku: '111',
          completenessLevel: 1,
          manufacturer: 'Microsoft',
          name: 'Updated product',
          inStock: false,
        } as Product;

        const action2 = loadProductSuccess({ payload: { product: updatedProduct } });
        const state2 = productsReducer(state1, action2);

        expect(state2.ids).toHaveLength(1);
        expect(state2.entities[product.sku]).toMatchInlineSnapshot(`
          Object {
            "completenessLevel": 2,
            "inStock": false,
            "longDescription": "some description",
            "manufacturer": "Microsoft",
            "name": "Updated product",
            "sku": "111",
          }
        `);
      });

      it('should set loading to false', () => {
        const action = loadProductSuccess({ payload: { product } });
        const state = productsReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('LoadProductVariations actions', () => {
    describe('LoadProductVariations action', () => {
      it('should set loading to true', () => {
        const action = loadProductVariations({ payload: { sku: '123' } });
        const state = productsReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('LoadProductVariationsSuccess action', () => {
      it('should set product variation data and set loading to false', () => {
        const product = { sku: 'SKU' } as Product;
        let state = productsReducer(initialState, loadProductSuccess({ payload: { product } }));

        state = productsReducer(
          state,
          loadProductVariationsSuccess({
            payload: {
              sku: 'SKU',
              variations: ['VAR'],
              defaultVariation: 'VAR',
            },
          })
        );

        expect(state.entities.SKU).toHaveProperty('variationSKUs', ['VAR']);
        expect(state.loading).toBeFalse();
      });
    });

    describe('LoadProductVariationsFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpError;
        const action = loadProductVariationsFail({ payload: { error, sku: 'SKU' } });
        const state = productsReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });
});
