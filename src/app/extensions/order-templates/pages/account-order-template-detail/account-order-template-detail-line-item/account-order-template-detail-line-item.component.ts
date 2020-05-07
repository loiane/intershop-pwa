import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { ShoppingFacade } from 'ish-core/facades/shopping.facade';
import { ProductView } from 'ish-core/models/product-view/product-view.model';
import { ProductCompletenessLevel } from 'ish-core/models/product/product.model';

import { OrderTemplatesFacade } from '../../../facades/order-templates.facade';
import { OrderTemplate, OrderTemplateItem } from '../../../models/order-templates/order-template.model';

@Component({
  selector: 'ish-account-order-template-detail-line-item',
  templateUrl: './account-order-template-detail-line-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOrderTemplateDetailLineItemComponent implements OnChanges, OnInit {
  constructor(private productFacade: ShoppingFacade, private orderTemplatesFacade: OrderTemplatesFacade) {}

  private static REQUIRED_COMPLETENESS_LEVEL = ProductCompletenessLevel.List;
  @Input() orderTemplateItemData: OrderTemplateItem;
  @Input() currentOrderTemplate: OrderTemplate;
  @Input() selectedItemsForm: FormArray;

  addToCartForm: FormGroup;
  selectItemForm: FormGroup;
  product$: Observable<ProductView>;

  ngOnInit() {
    this.initForm();
    this.updateQuantities();
  }

  ngOnChanges(s: SimpleChanges) {
    if (s.orderTemplateItemData) {
      this.loadProductDetails();
    }
  }

  updateQuantities() {
    this.addToCartForm.valueChanges.subscribe(val =>
      this.updateProductQuantity(this.orderTemplateItemData.sku, val.quantity)
    );
  }

  /** init form in the beginning */
  private initForm() {
    this.addToCartForm = new FormGroup({
      quantity: new FormControl(
        this.orderTemplateItemData.desiredQuantity.value ? this.orderTemplateItemData.desiredQuantity.value : 1
      ),
    });

    this.selectItemForm = new FormGroup({
      productCheckbox: new FormControl(true),
      sku: new FormControl(this.orderTemplateItemData.sku),
    });

    this.selectedItemsForm.push(this.selectItemForm);
  }

  addToCart(sku: string) {
    this.productFacade.addProductToBasket(sku, Number(this.addToCartForm.get('quantity').value));
  }

  moveItemToOtherOrderTemplate(sku: string, orderTemplateMoveData: { id: string; title: string }) {
    if (orderTemplateMoveData.id) {
      this.orderTemplatesFacade.moveItemToOrderTemplate(
        this.currentOrderTemplate.id,
        orderTemplateMoveData.id,
        sku,
        Number(this.addToCartForm.get('quantity').value)
      );
    } else {
      this.orderTemplatesFacade.moveItemToNewOrderTemplate(
        this.currentOrderTemplate.id,
        orderTemplateMoveData.title,
        sku,
        Number(this.addToCartForm.get('quantity').value)
      );
    }
  }

  updateProductQuantity(sku: string, quantity: number) {
    this.orderTemplatesFacade.addProductToOrderTemplate(
      this.currentOrderTemplate.id,
      sku,
      quantity - this.orderTemplateItemData.desiredQuantity.value
    );
  }

  removeProductFromOrderTemplate(sku: string) {
    this.orderTemplatesFacade.removeProductFromOrderTemplate(this.currentOrderTemplate.id, sku);
  }

  /**if the orderTemplateItem is loaded, get product details*/
  private loadProductDetails() {
    if (!this.product$) {
      this.product$ = this.productFacade.product$(
        this.orderTemplateItemData.sku,
        AccountOrderTemplateDetailLineItemComponent.REQUIRED_COMPLETENESS_LEVEL
      );
    }
  }
}