import { cls } from '#/libs/utils';

type BreakPoint = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const mapLine = {
  sm: 'sm:inline',
  md: 'md:inline',
  lg: 'lg:inline',
  xl: 'xl:inline',
  xxl: '2xl:inline',
} as const;

const mapHidden = {
  sm: 'sm:hidden',
  md: 'md:hidden',
  lg: 'lg:hidden',
  xl: 'xl:hidden',
  xxl: '2xl:hidden',
} as const;

/**
 * 특정 breakpoint 이상일 때만 children 노출
 */
export function ResponsiveShow({
  above,
  children,
  className = '',
}: {
  above: BreakPoint;
  children: React.ReactNode;
  className?: string;
}) {
  // sm 이상 → hidden sm:inline
  return <span className={cls(`hidden`, mapLine[above], className)}>{children}</span>;
}

/**
 * 특정 breakpoint 이상에서는 숨김
 */
export function ResponsiveHide({
  above,
  children,
  className = '',
}: {
  above: BreakPoint;
  children: React.ReactNode;
  className?: string;
}) {
  // sm 이상 → sm:hidden
  return <span className={cls(mapHidden[above], className)}>{children}</span>;
}
