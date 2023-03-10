import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '@app/core/user.service';
import {slideInOut} from '../../animations/slideInOut';
import {StorageService} from '@app/shared/services/storage.service';
import {ActivatedRoute} from '@angular/router';
import {BrowserService} from '@app/shared/services/browser.service';
import {Subscription} from 'rxjs/internal/Subscription';
import {SharedComponent} from '../shared.component';
import {SharedService} from '@app/shared/services/shared.service';

@Component({
    selector: 'app-cards-select',
    templateUrl: './cards-select.html',
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    animations: [slideInOut]
})
export class CardsSelectComponent implements OnInit, OnDestroy, AfterViewInit {
    public showPanelDD = false;
    public parentNode: ElementRef;
    public checkAll = true;
    public textCards: string;
    readonly storageKey: string;

    public get selectedCards(): any[] {
        return Array.isArray(this.userService.appData.userData.creditCards)
            ? this.userService.appData.userData.creditCards.reduce(
                (acmltr, cardsAcc) => {
                    return cardsAcc.children && cardsAcc.children.length
                        ? acmltr.concat(
                            cardsAcc.children.filter((card) => card.check === true)
                        )
                        : acmltr;
                },
                []
            )
            : [];
    }

    @Input()
    set cards(cards: any) {
        if (cards) {
            //   // const detailsFilterAcc = this.storageService.sessionStorageGetterItem(this.route.routeConfig.path + '-filterAcc');
            //   // const detailsFilterAccParse = detailsFilterAcc ? JSON.parse(detailsFilterAcc) : [];
            //   this.changedTrigger.emit(false);
            if (Array.isArray(this.userService.appData.userData.creditCards)) {
                if (!this.readFromStorage()) {
                    this.applyDefaults();
                }
                this.checkHowManyChecked();
            }
        }
    }

    @Input() isBankAndCreditScreen: boolean = false;

    @Output() changedTrigger = new EventEmitter<boolean>();

    cardsListArrivedSub: Subscription;

    static storageKey(route: ActivatedRoute, replaceLastWith?: string): string {
        const pathToRoot = route.pathFromRoot
            .filter((actRoute) => actRoute.snapshot.url.length)
            .reduce((path, actRoute) => path.concat(actRoute.snapshot.url), []);

        // if (replaceLastWith) {
        //     pathToRoot.splice(-1, 1, replaceLastWith);
        // }
        // return pathToRoot.slice(-2).join('/') + '-filterCards';
        return [pathToRoot.slice(-2, -1), '*-filterCards'].join('/');
    }

    constructor(
        public translate: TranslateService,
        public userService: UserService,
        private _element: ElementRef,
        private storageService: StorageService,
        private route: ActivatedRoute,
        public sharedService: SharedService,
        public sharedComponent: SharedComponent
    ) {
        this.storageKey = CardsSelectComponent.storageKey(this.route);
        // this.readFromStorage();

        // interval(10)
        //     .pipe(
        //         takeUntil(timer(20000)),
        //         takeWhileInclusive(() => (!this.userService.appData
        //             || !this.userService.appData.userData || !this.userService.appData.userData.creditCards)),
        //         tap(null, null, () => {
        //             if (!this.readFromStorage()) {
        //                 this.applyDefaults();
        //             }
        //             this.checkHowManyChecked();
        //         })
        //     )
        //     .subscribe(() => console.log('Waiting for cards....'));
    }

    private applyDefaults() {
        this.userService.appData.userData.creditCards.forEach((cardsAcc) => {
            cardsAcc.children.forEach((card) => (card.check = true));
            cardsAcc.check = cardsAcc.children.every((card) => card.check);
        });
        this.checkAll = this.userService.appData.userData.creditCards.every(
            (cardsAcc) => cardsAcc.check
        );
    }

    @HostListener('document:click', ['$event'])
    onClickOutside($event: any) {
        // console.log('%o, -- %o', $event, this.parentNode);
        const elementRefInPath = BrowserService.pathFrom($event).find(
            (node) => node === this._element.nativeElement
        );
        if (!elementRefInPath) {
            if (this.showPanelDD) {
                this.showPanelDD = false;
            }
        }
    }

    ngAfterViewInit(): void {
        this.parentNode = this._element.nativeElement;
        //
        // if (this.userService.appData.userData.creditCards) {
        //   this.checkAll = this.userService.appData.userData.creditCards.every(ccAcc => ccAcc.check === true);
        //   this.checkHowManyChecked();
        // }
    }

    ngOnInit(): void {
        console.log('ngOnInit')
        // if (this.cards) {
        //
        // } else {
        //     this.cardsListArrivedSub = this.sharedComponent.getDataEventGotAcc
        //         .pipe(
        //             startWith(true),
        //             map(() => this.userService.appData && this.userService.appData.userData && this.userService.appData.userData.companySelect
        //                 ? this.userService.appData.userData.companySelect.companyId : null),
        //             filter(companyId => !!companyId),
        //             tap(() => this.userService.appData.userData.creditCards = null),
        //             map(() => this.userService.appData.userData.accounts),
        //             switchMap((val) => {
        //                 if (Array.isArray(val)) {
        //                     return this.sharedService.getCreditCardDetails(
        //                         val.map((id) => {
        //                             return {'uuid': id.companyAccountId};
        //                         })
        //                     );
        //                 }
        //                 return of(null);
        //             }),
        //             map(response => response && !response.error ? response.body : null),
        //             tap((response:any) => this.userService.rebuildSelectedCompanyCreditCards(response))
        //         )
        //         .subscribe(() => {
        //             if (Array.isArray(this.userService.appData.userData.creditCards)) {
        //                 if (!this.readFromStorage()) {
        //                     this.applyDefaults();
        //                 }
        //                 this.checkHowManyChecked();
        //             }
        //         });
        // }
    }

    changeAll() {
        this.userService.appData.userData.creditCards.forEach((cards, idx, arr) => {
            arr[idx].check = this.checkAll;
            cards.children.forEach((card, idx1, arr1) => {
                arr1[idx1].check = this.checkAll;
            });
        });
        this.checkHowManyChecked();
    }

    changeSelectionAt(card?: any, mainParent?: any) {
        if (card.children) {
            card.children.forEach((c, idx, arr) => {
                arr[idx].check = card.check;
            });
            if (card.check) {
                let allCheck: boolean = true;
                this.userService.appData.userData.creditCards.forEach(
                    (cards, idx, arr) => {
                        const lenCheckAll = cards.children.filter((c) => c.check);
                        if (lenCheckAll.length !== cards.children.length) {
                            allCheck = false;
                        }
                    }
                );
                this.checkAll = allCheck;
            } else {
                this.checkAll = false;
            }
        } else {
            const lenCheck = mainParent.children.filter((c) => c.check);
            if (lenCheck.length !== mainParent.children.length) {
                mainParent.check = false;
                this.checkAll = false;
            } else {
                mainParent.check = true;
                let allCheck: boolean = true;
                this.userService.appData.userData.creditCards.forEach(
                    (cards, idx, arr) => {
                        const lenCheckAll = cards.children.filter((c) => c.check);
                        if (lenCheckAll.length !== cards.children.length) {
                            allCheck = false;
                        }
                    }
                );
                this.checkAll = allCheck;
            }
        }
        this.checkHowManyChecked();
    }

    checkHowManyChecked() {
        if (!this.checkAll) {
            let numCheck = 0,
                creditCardNickname = '',
                izuCustId = '';
            this.userService.appData.userData.creditCards.forEach(
                (cards, idx, arr) => {
                    const lenCheckAll = cards.children.filter((c) => c.check);
                    if (lenCheckAll.length) {
                        creditCardNickname = lenCheckAll[0].creditCardNickname;
                        izuCustId = lenCheckAll[0].izuCustId
                            ? ' ' + lenCheckAll[0].izuCustId
                            : '';
                    }
                    numCheck += lenCheckAll.length;
                }
            );
            if (numCheck === 0) {
                this.textCards =
                    this.translate.translations[
                        this.translate.currentLang
                        ].actions.creditCard;
            } else if (numCheck === 1) {
                this.textCards =
                    creditCardNickname + (this.isBankAndCreditScreen ? izuCustId : '');
            } else {
                this.textCards =
                    this.translate.translations[
                        this.translate.currentLang
                        ].filters.multiSelection;
            }
        }
        // this.storageService.sessionStorageClear('sortableIdGrCards');
        this.changedTrigger.emit(true);
        this.writeToStorage();
    }

    ngOnDestroy(): void {
        if (this.cardsListArrivedSub) {
            this.cardsListArrivedSub.unsubscribe();
        }
    }

    private readFromStorage(): boolean {
        // if (!this.userService.appData || !this.userService.appData.userData || !this.userService.appData.userData.creditCards) {
        //   return;
        // }

        try {
            const storedParsed = JSON.parse(
                this.storageService.sessionStorageGetterItem(this.storageKey)
            );
            if (storedParsed instanceof Array) {
                this.userService.appData.userData.creditCards.forEach((cardsAcc) => {
                    if (storedParsed.includes(cardsAcc.companyAccountId)) {
                        cardsAcc.children.forEach((card) => {
                            card.check = true;
                        });
                        cardsAcc.check = true;
                    } else {
                        cardsAcc.children.forEach((card) => {
                            card.check = storedParsed.includes(card.creditCardId);
                        });
                        cardsAcc.check = cardsAcc.children.every((card) => card.check);
                    }
                });

                this.checkAll = this.userService.appData.userData.creditCards.every(
                    (cardsAcc) => cardsAcc.check
                );

                return this.userService.appData.userData.creditCards.some(
                    (cardsAcc) => {
                        return cardsAcc.children.some((card) => card.check);
                    }
                );
                // return true;
            }
        } catch (e) {
            console.error('Failed to apply session storage value.', e);
        }
        return false;
    }

    private writeToStorage(): void {
        this.storageService.sessionStorageSetter(
            this.storageKey,
            JSON.stringify(this.selectedCards.map((card) => card.creditCardId))
        );
    }

    applySelection(creditCardIds: any[]) {
        const currSelection = this.selectedCards;

        if (
            currSelection.length !== creditCardIds.length ||
            currSelection.some((cc) => creditCardIds.indexOf(cc.creditCardId) < 0)
        ) {
            this.userService.appData.userData.creditCards.forEach((cardsAcc) => {
                cardsAcc.children.forEach(
                    (cc) => (cc.check = creditCardIds.indexOf(cc.creditCardId) >= 0)
                );
                cardsAcc.check = cardsAcc.children.every((card) => card.check);
            });

            this.checkAll = this.userService.appData.userData.creditCards.every(
                (cardsAcc) => cardsAcc.check
            );

            this.checkHowManyChecked();
        }
    }
}
