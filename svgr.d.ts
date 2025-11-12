declare module '*.svg' {
  import type { SVGProps, ForwardRefExoticComponent, RefAttributes } from 'react';
  const ReactComponent: ForwardRefExoticComponent<
    SVGProps<SVGSVGElement> & RefAttributes<SVGSVGElement>
  >;
  export default ReactComponent;
}
