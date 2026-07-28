// Generated from design/admin-ui.md §2
export const tokens = {
  "ramps": {
    "slate": [
      "f7f7f7",
      "eeeeef",
      "dededf",
      "c7c7c9",
      "aaaaac",
      "8c8c8e",
      "717173",
      "585859",
      "424243",
      "2e2e2f",
      "141415"
    ],
    "gold": [
      "fff0da",
      "ffe5c7",
      "ffd1aa",
      "f7b889",
      "de9965",
      "be7a43",
      "a05f28",
      "824710",
      "653300",
      "4a2100",
      "361500"
    ],
    "green": [
      "d8ffde",
      "c3ffcd",
      "a3f5b2",
      "7de292",
      "51c66f",
      "1fa74e",
      "008a34",
      "006e1e",
      "00550d",
      "003c02",
      "002b00"
    ],
    "amber": [
      "fff0c7",
      "ffe5ac",
      "ffd084",
      "ffb655",
      "e9960c",
      "c97600",
      "ab5b00",
      "8b4200",
      "6d2f00",
      "501d00",
      "3b1100"
    ],
    "red": [
      "ffe1d7",
      "ffd0c3",
      "ffb4a5",
      "ff9283",
      "ff6a5e",
      "f3413b",
      "d11c1f",
      "ac0003",
      "880000",
      "650000",
      "4c0000"
    ],
    "violet": [
      "f8edff",
      "f1e0ff",
      "e2c9ff",
      "cdadff",
      "b28aff",
      "9567ff",
      "7b4be0",
      "6131bb",
      "4b1d96",
      "350b71",
      "260156"
    ]
  },
  "semantic": {
    "bg": [
      "canvas",
      "surface",
      "subtle",
      "muted",
      "row-hover",
      "surface-inverse",
      "glass"
    ],
    "text": [
      "primary",
      "secondary",
      "disabled",
      "on-accent",
      "on-neutral",
      "inverse"
    ],
    "border": [
      "default",
      "strong",
      "focus"
    ],
    "action": [
      "primary",
      "primary-hover",
      "primary-transparent",
      "neutral",
      "neutral-hover",
      "secondary"
    ],
    "status": [
      "success",
      "warning",
      "danger",
      "success-text",
      "warning-text",
      "danger-text"
    ]
  }
} as const;
export type TokenRamp = keyof typeof tokens.ramps;
export type TokenStep = 50|100|200|300|400|500|600|700|800|900|950;
