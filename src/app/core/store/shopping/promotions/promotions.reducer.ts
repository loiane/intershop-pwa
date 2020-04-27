import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { Promotion } from 'ish-core/models/promotion/promotion.model';

import { loadPromotionSuccess } from './promotions.actions';

export const promotionAdapter = createEntityAdapter<Promotion>({
  selectId: promotion => promotion.id,
});

export interface PromotionsState extends EntityState<Promotion> {}

export const initialState: PromotionsState = promotionAdapter.getInitialState({});

export function promotionsReducer(state = initialState, action: Action): PromotionsState {
  return reducer(state, action);
}

const reducer = createReducer(
  initialState,
  on(loadPromotionSuccess, (state, action) => {
    const promotion = action.payload.promotion;
    return promotionAdapter.upsertOne(promotion, state);
  })
);
