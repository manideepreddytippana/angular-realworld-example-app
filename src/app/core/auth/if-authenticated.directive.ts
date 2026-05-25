import { DestroyRef, Directive, inject, Input, OnInit, signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserService } from './services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[ifAuthenticated]',
  standalone: true,
})
export class IfAuthenticatedDirective<T> implements OnInit {
  destroyRef = inject(DestroyRef);
  constructor(
    private templateRef: TemplateRef<T>,
    private userService: UserService,
    private viewContainer: ViewContainerRef,
  ) {}

  isAuthenticated = signal<boolean | null>(null);
  condition = signal(false);
  hasView = signal(false);

  ngOnInit() {
    this.userService.isAuthenticated.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isAuthenticated: boolean) => {
      this.isAuthenticated.set(isAuthenticated);
      this.updateView();
    });
  }

  @Input() set ifAuthenticated(condition: boolean) {
    this.condition.set(condition);
    this.updateView();
  }

  private updateView(): void {
    const isAuthenticated = this.isAuthenticated();

    if (isAuthenticated === null) {
      return;
    }

    const shouldShow = (isAuthenticated && this.condition()) || (!isAuthenticated && !this.condition());

    if (shouldShow && !this.hasView()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView.set(true);
      return;
    }

    if (!shouldShow && this.hasView()) {
      this.viewContainer.clear();
      this.hasView.set(false);
    }
  }
}
