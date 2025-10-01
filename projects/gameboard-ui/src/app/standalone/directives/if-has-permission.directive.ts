// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Directive, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserService as LocalUserService } from '@/utility/user.service';
import { UserRolePermissionKey } from '@/api/user-role-permissions.models';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';
import { ApiUser } from '@/api/user-models';

@Directive({
  providers: [UnsubscriberService],
  selector: '[appIfHasPermission]',
  standalone: true
})
export class IfHasPermissionDirective implements OnChanges {
  private hasView = false;
  @Input('[appIfHasPermission]') private requiredPermission?: UserRolePermissionKey;

  constructor(
    private localUser: LocalUserService,
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

  ngOnInit() {
    this.evaluate(this.localUser.user$.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.requiredPermission)
      this.evaluate(this.localUser.user$.value);
  }

  private evaluate(user: ApiUser | null | undefined) {
    const hasPermission = this.requiredPermission && user && this.permissionsService.canUser(user, this.requiredPermission);

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
