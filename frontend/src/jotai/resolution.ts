import { atom } from 'jotai';

import { Resolution } from '@/types';

export const resolutionAtom = atom<Resolution | null>(null);
