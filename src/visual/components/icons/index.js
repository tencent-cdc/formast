// https://github.com/danklammer/bytesize-icons MIT

import React from 'react';

function Svg(props) {
  return (
    <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      {props.children}
    </svg>
  );
}

export function SettingIcon() {
  return (
    <Svg>
      <path d="M13 2 L13 6 11 7 8 4 4 8 7 11 6 13 2 13 2 19 6 19 7 21 4 24 8 28 11 25 13 26 13 30 19 30 19 26 21 25 24 28 28 24 25 21 26 19 30 19 30 13 26 13 25 11 28 8 24 4 21 7 19 6 19 2 Z" />
      <circle cx="16" cy="16" r="4" />
    </Svg>
  );
}

export function DeleteIcon() {
  return (
    <Svg>
      <path d="M28 6 L6 6 8 30 24 30 26 6 4 6 M16 12 L16 24 M21 12 L20 24 M11 12 L12 24 M12 6 L13 2 19 2 20 6" />
    </Svg>
  );
}

export function EditIcon() {
  return (
    <Svg>
      <path d="M30 7 L25 2 5 22 3 29 10 27 Z M21 6 L26 11 Z M5 22 L10 27 Z" />
    </Svg>
  );
}

export function AddIcon() {
  return (
    <Svg>
      <path d="M16 2 L16 30 M2 16 L30 16" />
    </Svg>
  );
}

export function InfoIcon() {
  return (
    <Svg>
      <path d="M16 14 L16 23 M16 8 L16 10" />
      <circle cx="16" cy="16" r="14" />
    </Svg>
  );
}

export function ArrayDownIcon() {
  return (
    <Svg>
      <path d="M30 12 L16 24 2 12" />
    </Svg>
  );
}

export function MoveIcon() {
  return (
    <Svg>
       <path d="M3 16 L29 16 M16 3 L16 29 M12 7 L16 3 20 7 M12 25 L16 29 20 25 M25 12 L29 16 25 20 M7 12 L3 16 7 20" />
    </Svg>
  );
}
