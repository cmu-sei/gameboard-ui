// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { inject } from '@angular/core';
import { PracticeService } from '@/services/practice.service';

export const practiceModeEnabledGuard = () => inject(PracticeService).isEnabled();
