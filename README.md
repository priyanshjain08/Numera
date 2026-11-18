# Numera — a little number lab

A pastel-themed, browser-based number system converter inspired by the original menu-driven C assignment. Numera converts whole numbers between **binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16)**.

## Features

- All 12 directed conversions between the four supported bases
- Live conversion as you type
- Swap source and destination bases
- Input validation with helpful messages
- Copy converted results
- Recent conversion history (kept for the current page session)
- Large integer support in the browser through JavaScript `BigInt`
- Responsive light interface with soft pastel colours
- No account, server, or external API required

## Run locally

Open `index.html` in a browser. For the best experience, use a small local web server (for example, VS Code Live Server) so browser clipboard permissions work as expected.

## Deploy on GitHub Pages

1. Upload the contents of this folder to your GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your main branch and the `/ (root)` folder, then save.
5. Open the Pages URL GitHub provides.

## Project structure

```text
Numera/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── src/
│   └── converter.c
└── README.md
```

## About the C source

`src/converter.c` is a cleaned-up, reusable C conversion core based on the original assignment's conversion logic. The hosted static website currently runs its browser-side conversion implementation in `js/app.js`, so it works immediately on GitHub Pages without a server or a WebAssembly build step. The C implementation is included as the native/core version and can be compiled separately or integrated into a future WebAssembly build.

Compile the C core as an object file with a C compiler:

```bash
gcc -std=c11 -Wall -Wextra -c src/converter.c -o converter.o
```

## Supported input

- Binary: `0` and `1`
- Octal: `0` through `7`
- Decimal: `0` through `9`
- Hexadecimal: `0` through `9`, `A` through `F` (case-insensitive)
- Positive and negative whole numbers are supported in the web app.

## Original assignment

The original program offered the twelve conversions between binary, octal, decimal and hexadecimal through a terminal menu. Numera keeps that same set of number systems, but gives it a friendly graphical interface for the browser.
