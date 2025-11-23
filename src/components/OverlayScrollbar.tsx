'use client';

import { ClickScrollPlugin, OverlayScrollbars } from 'overlayscrollbars';
import {
  OverlayScrollbarsComponent,
  OverlayScrollbarsComponentProps,
} from 'overlayscrollbars-react';

OverlayScrollbars.plugin(ClickScrollPlugin);

export default function OverlayScrollbar(props: OverlayScrollbarsComponentProps<'div'>) {
  return (
    <OverlayScrollbarsComponent
      {...props}
      options={{
        scrollbars: { autoHide: 'never', clickScroll: true, theme: 'os-theme-custom' },
        overflow: { x: 'hidden' },
        ...props.options,
      }}
    >
      {props.children}
    </OverlayScrollbarsComponent>
  );
}
