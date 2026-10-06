# Amelie du Toit

Amelie du Toit is a designer and illustrator based in Cape Town. She studied at the Design Academy in Stellenbosch, and is a two-time nominated finalist at the Loeries Awards 2026.

# Portfolio

A lightweight, no-build portfolio for GitHub Pages. Plain HTML, CSS and a bit of JavaScript.
All content lives in two JSON files.

```
index.html            page shell (edit <title> and description here)
style.css             look and feel, tweak the variables at the top
script.js             renders everything from the JSON (rarely needs editing)
favicon.svg           browser tab icon
data/site.json        your name, about text, email, Instagram
data/projects.json    your projects and images
images/<project>/     your photos
tools/optimize.py     optional: resize photos for the web
Preview Site.command  Mac: double-click to preview locally
```

## Add a project

1. Put your photos in `images/my-project/` (see "Prepare photos" below).
2. Add an entry to `data/projects.json`. **The order in the file is the order in the list.**

```json
{
  "title": "My Project",
  "slug": "my-project",
  "caption": "Short line shown next to the image.",
  "images": [
    "images/my-project/01.png",
    "images/my-project/02.png",
    { "src": "images/my-project/03.png", "caption": "Overrides the project caption for this image", "alt": "Screen reader description" }
  ]
}
```

| Field      | Required | Notes |
|------------|----------|-------|
| `title`    | yes      | Shown in the list |
| `slug`     | no       | Used in the URL (`#my-project`). Defaults to the title, lowercased |
| `caption`  | no       | Text shown beside the image |
| `images`   | yes      | Each item is either a path string, or `{ "src", "caption", "alt" }` |
| `hidden`   | no       | `true` keeps a project in the file but off the site |

To reorder, move the entry. To remove, delete it (or set `"hidden": true`).

Every project and image has a shareable link: `#my-project` or `#my-project/3`.

## Change your name, bio and links

Edit `data/site.json`. `name.first` is the big word at the top, `name.last` the big word at the bottom.
Remove `about`, `email` or `instagram` and the matching footer link disappears.
Also update `<title>` and the description in `index.html`, which is what search results and link previews show.

## Look and feel

The variables at the top of `style.css` control colors, font, name size, text size and the width of the image column.
To use a different typeface, load it in `index.html` (for example from Google Fonts) and change `--font`.

## Prepare photos

Keep each image around 1800px on the long edge, saved as PNG.
GitHub Pages recommends keeping a repo under 1 GB, so full-resolution originals shouldn't be committed.

```
pip install pillow
python3 tools/optimize.py ~/Desktop/originals/my-project images/my-project
```

It writes `01.png`, `02.png`... and prints the lines to paste into `projects.json`.

## Preview locally

**On a Mac:** double-click `Preview Site.command`. It starts a local server and opens the site in your browser.
Close the Terminal window to stop it. First-time setup, once only:

1. If macOS says it "could not be executed because you do not have appropriate access privileges", the executable flag was lost in the download. In Terminal type `chmod +x ` (with a trailing space), drag `Preview Site.command` onto the window and press Return.
2. If macOS says it is from an unidentified developer, double-click it once, then open System Settings > Privacy & Security, scroll to the Security section and click Open Anyway. (On macOS Sequoia and later, right-click > Open no longer bypasses this.) Alternatively run `xattr -d com.apple.quarantine ` on the file the same drag-and-drop way.

**Any system:** browsers block `fetch()` on files opened directly, so run a tiny server:

```
python3 -m http.server 8000
```

then open http://localhost:8000.

## Publish on GitHub Pages

1. Create a repo on GitHub (for a root address like `username.github.io`, name it exactly `username.github.io`).
2. Upload or push all of these files to the `main` branch.
3. Repo **Settings > Pages > Build and deployment**: Source = "Deploy from a branch", Branch = `main`, folder = `/ (root)`. Save.
4. After a minute the site is live. Every push to `main` updates it.

### Custom domain (optional)
In Settings > Pages, enter your domain, then add DNS records at your registrar as GitHub's instructions show
(four `A` records for an apex domain, or a `CNAME` record for `www`). Tick "Enforce HTTPS" once it's available.

## Controls

- Click the left/right half of the image, use the arrow buttons, swipe on a phone, or press the left/right keys to change image.
- Up/down keys move between projects.
- Clicking the first name returns to the first project.
