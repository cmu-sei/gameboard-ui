import { inject } from '@angular/core';
import { PracticeService } from '@/services/practice.service';

export const practiceModeEnabledGuard = () => inject(PracticeService).isEnabled();
