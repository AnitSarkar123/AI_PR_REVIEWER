import { expect, test, describe } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  test('merges standard tailwind classes', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  test('resolves conflicting tailwind classes using tailwind-merge', () => {
    // text-black should override text-white
    expect(cn('text-white', 'text-black')).toBe('text-black');
    // px-4 should override p-2 padding on the x-axis
    expect(cn('p-2', 'px-4')).toBe('p-2 px-4');
  });

  test('handles conditional classes using clsx', () => {
    const isActive = true;
    const isHovered = false;
    expect(cn('base-class', isActive && 'active-class', isHovered && 'hover-class')).toBe('base-class active-class');
  });

  test('handles arrays and objects', () => {
    expect(cn(['class1', 'class2'], { class3: true, class4: false })).toBe('class1 class2 class3');
  });
});
