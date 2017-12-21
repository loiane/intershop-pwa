import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalModule } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';
import { WishlistsService } from '../../../core/services/wishlists/wishlists.service';
import { WishlistsPageComponent } from './wishlists-page.component';

describe('Wishlists Page Component', () => {
  let fixture: ComponentFixture<WishlistsPageComponent>;
  let component: WishlistsPageComponent;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ModalModule.forRoot()
      ],
      providers: [
        { provide: WishlistsService, useFactory: () => instance(mock(WishlistsService)) }
      ],
      declarations: [WishlistsPageComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(WishlistsPageComponent);
      component = fixture.componentInstance;
      element = fixture.nativeElement;
      fixture.autoDetectChanges(true);
    });
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
  });

  it('should check if "Add to Wishlist" button is rendered', () => {
    const anchorTag = element.querySelector('.btn-default');
    expect(anchorTag).toBeTruthy();
  });

  // TODO: the relevance of this test needs to be discussed (counting input fields?)
  it('should check if input fields are rendered on HTML', () => {
    const inputFields = element.getElementsByClassName('form-control');
    expect(inputFields.length).toBe(4);
    expect(inputFields[0]).toBeTruthy();
    expect(inputFields[1]).toBeTruthy();
    expect(inputFields[2]).toBeTruthy();
  });
});