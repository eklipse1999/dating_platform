import { cn } from '@/lib/utils';

/**
 * Flexbox layout components
 */
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Flex({
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'stretch',
  gap = 'none',
  className,
  children,
  ...props
}: FlexProps) {
  const directionMap = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const wrapMap = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse',
  };

  const justifyMap = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const alignMap = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const gapMap = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12',
  };

  return (
    <div
      className={cn(
        'flex',
        directionMap[direction],
        wrapMap[wrap],
        justifyMap[justify],
        alignMap[align],
        gapMap[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Grid layout component
 */
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto-fit' | 'auto-fill';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Grid({
  cols = 4,
  gap = 'md',
  className,
  children,
  ...props
}: GridProps) {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    'auto-fit': 'grid-cols-auto-fit',
    'auto-fill': 'grid-cols-auto-fill',
  };

  const gapMap = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  return (
    <div
      className={cn(
        'grid',
        colsMap[cols],
        gapMap[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Container component for consistent page layouts
 */
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({
  size = 'lg',
  className,
  children,
  ...props
}: ContainerProps) {
  const sizeMap = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        sizeMap[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Section component for page sections
 */
interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'muted' | 'primary' | 'gradient';
}

export function Section({
  padding = 'md',
  background = 'default',
  className,
  children,
  ...props
}: SectionProps) {
  const paddingMap = {
    none: '',
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24',
  };

  const bgMap = {
    default: 'bg-background',
    muted: 'bg-muted/30',
    primary: 'bg-primary/5',
    gradient: 'bg-gradient-to-br from-primary/5 via-background to-secondary/5',
  };

  return (
    <section
      className={cn(
        paddingMap[padding],
        bgMap[background],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

/**
 * Card wrapper with consistent styling
 */
interface CardWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function CardWrapper({
  hover = false,
  padding = 'md',
  className,
  children,
  ...props
}: CardWrapperProps) {
  const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-card rounded-xl border border-border',
        hover && 'hover:border-primary/30 hover:shadow-lg transition-all duration-300',
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Stack component for vertical stacking
 */
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  divider?: boolean;
}

export function Stack({
  gap = 'md',
  divider = false,
  className,
  children,
  ...props
}: StackProps) {
  const gapMap = {
    none: '',
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  };

  return (
    <div
      className={cn(gapMap[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Inline component for horizontal items
 */
interface InlineProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  wrap?: boolean;
}

export function Inline({
  gap = 'md',
  wrap = true,
  className,
  children,
  ...props
}: InlineProps) {
  const gapMap = {
    none: '',
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
  };

  return (
    <div
      className={cn(
        'flex items-center',
        wrap && 'flex-wrap',
        gapMap[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
