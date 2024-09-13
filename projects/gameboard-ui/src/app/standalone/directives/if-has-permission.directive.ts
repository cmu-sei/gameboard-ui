import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserService } from '@/utility/user.service';
import { UserRolePermissionKey } from '@/api/user-role-permissions.models';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';
import { ApiUser } from '@/api/user-models';

@Directive({
  providers: [UnsubscriberService, UserService],
  selector: '[appIfHasPermission]',
  standalone: true
})
export class IfHasPermissionDirective {
  private hasView = false;
  @Input('[appIfHasPermission]') private requiredPermission?: UserRolePermissionKey;

  constructor(
    private localUser: UserService,
    private permissionsService: UserRolePermissionsService,
    private templateRef: TemplateRef<any>,
    private unsub: UnsubscriberService,
    private viewContainer: ViewContainerRef,
  ) {
    this.unsub.add(this.localUser.user$.subscribe(u => this.evaluate(u)));
  }

  @Input() set appIfHasPermission(permission: UserRolePermissionKey) {
    this.requiredPermission = permission;
    this.evaluate(this.localUser.user$.value);
  }

  private evaluate(user: ApiUser | null | undefined) {
    const hasPermission = this.requiredPermission && user && this.permissionsService.can(user, this.requiredPermission);

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
