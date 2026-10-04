# parasetam0l.github.io

A page showing the apps I build for myself — DevStack, SemiVPN, Local Desktop and Vidsilo — served by GitHub Pages at <https://parasetam0l.github.io>.

It is a static page with no build step: `.nojekyll` tells GitHub Pages to serve the files as they are.

## Layout

| Path | Contents |
| --- | --- |
| `index.html` | The page: headline and one tile per app, each with a small animated scene |
| `404.html` | Shown by GitHub Pages for unknown paths (uses root-relative links) |
| `assets/site.css` | All styles; colours and fonts are tokens at the top |
| `assets/site.js` | Optional enhancements: scroll reveals, the SemiVPN routing demo, current year, latest release versions |
| `assets/icons/` | App icons: 256 px WebP, Vidsilo as SVG |
| `assets/fonts/` | Fraunces and JetBrains Mono (SIL OFL, licences alongside) |
| `assets/og.png` | Social preview image (1200 × 630) |

## Preview locally

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Updating

- **Versions** update themselves: `site.js` fetches each app's latest GitHub release and replaces the version marked with `data-release="<repo>"`. The version written in the HTML is the fallback, so bump it now and then.
- **A new app**: copy one of the `<article class="tile …">` blocks in `index.html`, add a 256 px icon to `assets/icons/`, set the tile's accent with `style="--c: …"` and its reveal order with `--i`, and give it a grid span next to the `.t-*` rules in `site.css` (the grid has 12 columns on desktop, 2 on tablets, 1 on phones).
- **Accent colours** are one per app, taken from its icon: teal for DevStack, violet for SemiVPN, sky for Local Desktop, fuchsia for Vidsilo.
- **Motion** respects the system's reduce-motion setting: every animation stops at a still frame.
