import Icon from '@ant-design/icons';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Sidebar nav glyphs taken from the SPEC Figma file (`Sidebar` node `8066:130620`, one node per row).
 *
 * The design ships its own 16-grid icon set, so none of these map onto `@ant-design/icons`: even Home and
 * Part Search, which reuse Ant glyph outlines, are scaled to fill the full 16px frame instead of Ant's
 * 1024 viewBox with built-in padding. Path data is copied verbatim from the Figma SVG export; the only edits
 * are the baked color swapped for `currentColor` (so antd `Menu` default / hover / selected states drive it)
 * and, where Figma nested a group, the group's measured offset expressed as a `translate`.
 *
 * Treat this file like a set of committed `.svg` assets: the numbers are vector geometry, not design tokens.
 */
const strokeProps = {
  stroke: 'currentColor',
  strokeWidth: 1.1,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

type NavIconProps = { className?: string; style?: CSSProperties };

/** Figma exports a 16px frame and clips the overflow; the SVG viewport clips identically. */
function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" focusable="false">
      {children}
    </svg>
  );
}

function HomeSvg() {
  return (
    <Glyph>
      <path
        d="M15.7599 7.87396L8.85987 0.97753L8.39737 0.51503C8.29199 0.410345 8.14948 0.351592 8.00094 0.351592C7.8524 0.351592 7.70989 0.410345 7.60451 0.51503L0.242011 7.87396C0.134031 7.98152 0.0486927 8.10962 -0.00896693 8.2507C-0.0666265 8.39178 -0.0954387 8.54299 -0.0937029 8.69539C-0.08656 9.32396 0.436654 9.82574 1.06523 9.82574H1.82415V15.6418H14.1777V9.82574H14.9527C15.2581 9.82574 15.5456 9.7061 15.7617 9.49003C15.868 9.38398 15.9523 9.25788 16.0097 9.11902C16.067 8.98017 16.0962 8.83132 16.0956 8.6811C16.0956 8.37753 15.9759 8.09003 15.7599 7.87396V7.87396ZM9.00094 14.3561H7.00094V10.7132H9.00094V14.3561ZM12.892 8.54003V14.3561H10.1438V10.2847C10.1438 9.89003 9.82415 9.57039 9.42951 9.57039H6.57237C6.17772 9.57039 5.85808 9.89003 5.85808 10.2847V14.3561H3.10987V8.54003H1.39558L8.00272 1.93824L8.41522 2.35074L14.6081 8.54003H12.892Z"
        fill="currentColor"
      />
    </Glyph>
  );
}

function PartSearchSvg() {
  return (
    <Glyph>
      <path
        d="M11.1428 4.42532V3.56817C11.1428 3.4896 11.0785 3.42532 10.9999 3.42532H4.14279C4.06422 3.42532 3.99993 3.4896 3.99993 3.56817V4.42532C3.99993 4.50389 4.06422 4.56817 4.14279 4.56817H10.9999C11.0785 4.56817 11.1428 4.50389 11.1428 4.42532ZM4.14279 5.99675C4.06422 5.99675 3.99993 6.06103 3.99993 6.1396V6.99675C3.99993 7.07532 4.06422 7.1396 4.14279 7.1396H7.4285C7.50707 7.1396 7.57136 7.07532 7.57136 6.99675V6.1396C7.57136 6.06103 7.50707 5.99675 7.4285 5.99675H4.14279ZM6.71422 14.0682H2.57136V1.49674H12.5714V7.6396C12.5714 7.71817 12.6356 7.78246 12.7142 7.78246H13.7142C13.7928 7.78246 13.8571 7.71817 13.8571 7.6396V0.782459C13.8571 0.466388 13.6017 0.21103 13.2856 0.21103H1.85707C1.541 0.21103 1.28565 0.466388 1.28565 0.782459V14.7825C1.28565 15.0985 1.541 15.3539 1.85707 15.3539H6.71422C6.79279 15.3539 6.85707 15.2896 6.85707 15.211V14.211C6.85707 14.1325 6.79279 14.0682 6.71422 14.0682ZM14.6731 14.9878L13.0071 13.3217C13.4053 12.795 13.6428 12.1378 13.6428 11.4253C13.6428 9.6896 12.2356 8.28246 10.4999 8.28246C8.76422 8.28246 7.35707 9.6896 7.35707 11.4253C7.35707 13.161 8.76422 14.5682 10.4999 14.5682C11.1392 14.5682 11.7321 14.3771 12.2285 14.0503L13.9196 15.7414C13.9481 15.77 13.9839 15.7825 14.0196 15.7825C14.0553 15.7825 14.0928 15.7682 14.1196 15.7414L14.6731 15.1878C14.6863 15.1747 14.6968 15.1591 14.7039 15.142C14.711 15.1248 14.7147 15.1064 14.7147 15.0878C14.7147 15.0692 14.711 15.0508 14.7039 15.0337C14.6968 15.0165 14.6863 15.0009 14.6731 14.9878V14.9878ZM10.4999 13.4253C9.39457 13.4253 8.49993 12.5307 8.49993 11.4253C8.49993 10.32 9.39457 9.42532 10.4999 9.42532C11.6053 9.42532 12.4999 10.32 12.4999 11.4253C12.4999 12.5307 11.6053 13.4253 10.4999 13.4253Z"
        fill="currentColor"
      />
    </Glyph>
  );
}

function ContentSvg() {
  return (
    <Glyph>
      <g transform="translate(2.4496 0.4498)">
        <path d="M0.55 14.55H11.6658V3.175L8.99803 0.55H0.55V14.55Z" {...strokeProps} />
        <path d="M8.99983 0.55V3.175H11.6676" {...strokeProps} />
      </g>
      <g transform="translate(5.45 5.45)">
        <path d="M3.05 5.55V0.55" {...strokeProps} />
        <path d="M0.55 3.05L3.05 5.55L5.55 3.05" {...strokeProps} />
      </g>
    </Glyph>
  );
}

function BomSvg() {
  return (
    <Glyph>
      <path d="M2 2V14" {...strokeProps} />
      <path d="M2 3H4" {...strokeProps} />
      <path d="M2 8H4" {...strokeProps} />
      <path d="M2 13H4" {...strokeProps} />
      <path d="M5 2H7V4H5V2Z" {...strokeProps} />
      <path d="M5 7H7V9H5V7Z" {...strokeProps} />
      <path d="M5 12H7V14H5V12Z" {...strokeProps} />
      <path d="M8 3H14" {...strokeProps} />
      <path d="M8 8H14" {...strokeProps} />
      <path d="M8 13H14" {...strokeProps} />
    </Glyph>
  );
}

function SpecSvg() {
  return (
    <Glyph>
      <g transform="translate(0.4441 0.434)">
        <path
          d="M7.27735 12.9228H0.55V0.55H8.0161L10.3738 2.86989V7.37822"
          {...strokeProps}
        />
        <path d="M8.0182 0.55V2.86989H10.3759" {...strokeProps} />
        <path d="M2.82786 4.41562H7.80927" {...strokeProps} />
        <path d="M2.82786 10.0468H7.80927" {...strokeProps} />
        <path d="M2.74853 6.19603H3.53443" {...strokeProps} />
        <path d="M7.07004 6.19603H7.85594" {...strokeProps} />
        <path d="M2.74853 6.19603V8.2066" {...strokeProps} />
        <path d="M2.74853 8.2069H3.53443" {...strokeProps} />
        <path d="M7.85954 6.19603V8.2066" {...strokeProps} />
        <path d="M7.07004 8.2069H7.85594" {...strokeProps} />
        <path d="M4.16511 7.20146H6.44423" {...strokeProps} />
        <path
          d="M11.6311 9.00604C10.1279 9.00604 8.90592 10.2084 8.90592 11.6875C8.90592 13.1666 10.1279 14.369 11.6311 14.369C13.1344 14.369 14.3563 13.1666 14.3563 11.6875C14.3563 10.2084 13.1344 9.00604 11.6311 9.00604Z"
          {...strokeProps}
        />
        <path d="M10.5303 11.6861L11.3162 12.4594L12.8094 10.9128" {...strokeProps} />
      </g>
    </Glyph>
  );
}

function SeizBraceSvg() {
  return (
    <Glyph>
      <g transform="translate(0.4516 2.45)">
        <path d="M0.55 0.550131H3.9284" {...strokeProps} />
        <path d="M11.5312 0.550131H14.9096" {...strokeProps} />
        <path d="M2.24059 0.550131L5.19669 6.88463" {...strokeProps} />
        <path d="M13.2213 0.550131L10.2652 6.88463" {...strokeProps} />
        <path d="M4.51639 6.88412H5.86775" {...strokeProps} />
        <path d="M9.58435 6.88412H10.9357" {...strokeProps} />
        <path d="M4.51639 6.88412V11.1071" {...strokeProps} />
        <path d="M5.87422 6.88412V11.1071" {...strokeProps} />
        <path d="M9.58435 6.88412V11.1071" {...strokeProps} />
        <path d="M10.9422 6.88412V11.1071" {...strokeProps} />
        <path d="M1.3953 8.99545H14.0643" {...strokeProps} />
        <path d="M1.3953 8.06792V9.92604" {...strokeProps} />
        <path d="M14.0633 8.06792V9.92604" {...strokeProps} />
      </g>
    </Glyph>
  );
}

function SubmittalManagerSvg() {
  return (
    <Glyph>
      <path
        d="M6.66667 2H2.66667C2.29848 2 2 2.29848 2 2.66667V13.3333C2 13.7015 2.29848 14 2.66667 14H6.66667C7.03486 14 7.33333 13.7015 7.33333 13.3333V2.66667C7.33333 2.29848 7.03486 2 6.66667 2Z"
        {...strokeProps}
      />
      <path d="M4.66667 2V14" {...strokeProps} />
      <path
        d="M13.6011 12.5998C13.7345 12.9332 13.5345 13.3332 13.2011 13.4665L11.9345 13.9332C11.6011 14.0665 11.2011 13.8665 11.0678 13.5332L7.40114 3.39984C7.26781 3.0665 7.46781 2.6665 7.80114 2.53317L9.06781 2.0665C9.40114 1.93317 9.80114 2.13317 9.93447 2.4665L13.6011 12.5998Z"
        {...strokeProps}
      />
    </Glyph>
  );
}

function RevitSvg() {
  return (
    <Glyph>
      <g transform="translate(0.3874 0.4066)">
        <path d="M0.55 0.55H14.55V14.55H0.55V0.55Z" {...strokeProps} />
        <path d="M0.55 3.55H14.55" {...strokeProps} />
        <path d="M7.55 5.55L10.55 7.55L7.55 9.55L4.55 7.55L7.55 5.55Z" {...strokeProps} />
        <path d="M4.55 7.55V10.8259L7.55 12.55L10.55 10.8259V7.55" {...strokeProps} />
        <path d="M7.55 9.55V12.55" {...strokeProps} />
      </g>
    </Glyph>
  );
}

function KnowledgeCenterSvg() {
  return (
    <Glyph>
      <path d="M14 7.79533V3.33333" {...strokeProps} />
      <path
        d="M2 8C2.00016 8.51874 2.60495 9.01717 3.68674 9.39008C4.76853 9.76299 6.24266 9.9812 7.798 9.99867"
        {...strokeProps}
      />
      <path
        d="M2 3.33333V12.6667C1.99988 12.9346 2.16123 13.1998 2.47449 13.4465C2.78774 13.6932 3.24651 13.9164 3.82355 14.1029C4.4006 14.2894 5.08416 14.4353 5.83367 14.5321C6.58317 14.6288 7.38334 14.6743 8.18667 14.666"
        {...strokeProps}
      />
      <path
        d="M14.5 12.2996C14.5 13.7993 13.4062 14.5492 12.1063 14.9841C12.0382 15.0063 11.9642 15.0052 11.8969 14.9811C10.5938 14.5492 9.5 13.7993 9.5 12.2996V10.1999C9.5 10.1204 9.53292 10.0441 9.59153 9.98784C9.65013 9.93159 9.72962 9.89998 9.8125 9.89998C10.4375 9.89998 11.2187 9.54004 11.7625 9.08412C11.8287 9.02983 11.9129 9 12 9C12.0871 9 12.1713 9.02983 12.2375 9.08412C12.7844 9.54304 13.5625 9.89998 14.1875 9.89998C14.2704 9.89998 14.3499 9.93159 14.4085 9.98784C14.4671 10.0441 14.5 10.1204 14.5 10.1999V12.2996Z"
        {...strokeProps}
      />
      <path
        d="M8 5.33333C11.3137 5.33333 14 4.4379 14 3.33333C14 2.22876 11.3137 1.33333 8 1.33333C4.68629 1.33333 2 2.22876 2 3.33333C2 4.4379 4.68629 5.33333 8 5.33333Z"
        {...strokeProps}
      />
    </Glyph>
  );
}

export function HomeNavIcon(props: NavIconProps) {
  return <Icon component={HomeSvg} {...props} />;
}

export function PartSearchNavIcon(props: NavIconProps) {
  return <Icon component={PartSearchSvg} {...props} />;
}

export function ContentNavIcon(props: NavIconProps) {
  return <Icon component={ContentSvg} {...props} />;
}

export function BomNavIcon(props: NavIconProps) {
  return <Icon component={BomSvg} {...props} />;
}

export function SpecNavIcon(props: NavIconProps) {
  return <Icon component={SpecSvg} {...props} />;
}

export function SeizBraceNavIcon(props: NavIconProps) {
  return <Icon component={SeizBraceSvg} {...props} />;
}

export function SubmittalManagerNavIcon(props: NavIconProps) {
  return <Icon component={SubmittalManagerSvg} {...props} />;
}

export function RevitNavIcon(props: NavIconProps) {
  return <Icon component={RevitSvg} {...props} />;
}

export function KnowledgeCenterNavIcon(props: NavIconProps) {
  return <Icon component={KnowledgeCenterSvg} {...props} />;
}
