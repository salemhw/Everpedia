# The World Archives

A classic Wikipedia-inspired D&D campaign encyclopedia built with HTML, CSS, JavaScript, and JSON.

## What's included

- Responsive Wikipedia-inspired layout
- Search across article titles, categories, tags, and body text
- Category browsing and recent additions
- JSON-driven article pages
- Automatic table of contents
- Internal links using `[[article-id]]`
- Related articles
- GitHub Pages deployment workflow

## Run locally

Because the site loads JSON with `fetch()`, run it through a local web server rather than opening `index.html` directly.

### Python
```bash
python -m http.server 8000
```
Then open http://localhost:8000.

## Add an article

Edit `data/articles.json` and add an object to the array:

```json
{
  "id": "the-ashen-kingdom",
  "title": "The Ashen Kingdom",
  "category": "Geography",
  "summary": "A short description shown in article listings.",
  "updated": "2026-11-21",
  "tags": ["kingdom", "history"],
  "sections": [
    {
      "heading": "History",
      "paragraphs": [
        "Write the article here. Link to another entry with [[the-divine-order]]."
      ]
    }
  ],
  "related": ["the-known-world"]
}
```

Important:
- `id` must be unique, lowercase, and use hyphens instead of spaces.
- Use valid JSON: double quotes around keys and string values; no trailing commas.
- `category`, `summary`, `updated`, `tags`, `sections`, and `related` are supported fields.
- `related` must contain article IDs that exist in the JSON file.
- Internal inline links use `[[article-id]]`.

## GitHub Pages deployment

1. Create a GitHub repository for this project.
2. Upload the contents of this folder to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **GitHub Actions**.
5. Push to the `main` branch. The included workflow deploys the site.
6. Your Pages URL will appear in **Settings → Pages**.

If your default branch is not `main`, edit `.github/workflows/deploy.yml`.

## Privacy: read before publishing

GitHub Pages is public hosting for ordinary accounts. A private source repository does **not** make the published Pages website private. Anyone who can reach the published URL may be able to read its HTML, JavaScript, and JSON files.

This starter has a `data/dm/` folder reserved for future private notes, but **do not put secrets there**: files deployed to a static website are downloadable even if the interface hides them. A JavaScript password prompt or hidden link is not real access control.

For a genuinely private player/DM archive, put authentication in front of the site (for example, an identity-aware access gateway) and ensure the public GitHub Pages origin cannot be used to bypass it, or use a host with built-in authenticated access. The current build is a local prototype until that access-control layer is configured.

## Suggested next steps

- Replace the three sample placeholder articles with campaign canon.
- Add individual entries for each deity, kingdom, faction, NPC, creature, and artifact.
- Add a source/citation field to articles if you want in-world references.
- Add authenticated DM-only records before publishing private lore.
