import { InjectionToken, inject } from "@angular/core";
import { UserService as LocalUserService } from "@/utility/user.service";

export const IS_ADMIN_GUARD = new InjectionToken<any>("GUARD_IS_ADMIN", {
    providedIn: 'root',
    factory: () => inject(LocalUserService).user$.value?.isAdmin
});

export const IS_SUPPORT_GUARD = new InjectionToken<any>("GUARD_IS_SUPPORT", {
    providedIn: 'root',
    factory: () => inject(LocalUserService).user$.value?.isSupport
});
