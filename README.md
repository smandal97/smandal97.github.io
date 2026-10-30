# smandal97.github.io

Personal site of Soham Mandal, built with Jekyll for GitHub Pages.

## Where to edit things

| What | File |
| --- | --- |
| Name, position, email, links, CV path | `_config.yml` (the `author:` block) |
| About text and hero sentence | `index.html` |
| Publications | `_data/publications.yml` (newest first; your name is bolded automatically) |
| Talks | `_data/talks.yml` (`kind: invited` or `contributed`) |
| Outreach | `_data/outreach.yml` |
| Research projects | one Markdown file per project in `_research/` (`order` sets position on the home page, `summary` is the short text, the body is the full page) |
| CV | replace `files/SM_CV.pdf` |
| Colours and type | `assets/css/site.css` (tokens at the top) |
| Hero animation | `assets/js/shell.js` |

Old URLs (`/publications/`, `/talks/`, `/teaching/`, `/portfolio/...`) redirect to the new home-page sections.

## Preview locally

    bundle install
    bundle exec jekyll serve
