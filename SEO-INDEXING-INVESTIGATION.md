# SEO and Google Indexing Investigation

**Date:** 6 November 2026

## Findings

- Google currently associates the brand with `https://careercafe.co.ke`.
- `https://careercafeafrica.com` did not load during the live check.
- Google search results showed an older event date than the current site source, indicating stale indexed content.
- The live `robots.txt` and `sitemap.xml` URLs were returning the homepage HTML because those files were not present.
- The homepage already had a title and meta description, but it lacked a canonical URL, structured data, and complete social metadata.

## Changes made

- Added a canonical URL to the homepage and masterclass page.
- Added Open Graph and Twitter metadata.
- Added Organization JSON-LD structured data to the homepage.
- Added `robots.txt` allowing crawling and pointing to the sitemap.
- Added `sitemap.xml` with the main public pages.

## Validation

- Sitemap XML validated successfully with six URLs.
- Git whitespace validation passed.
- New SEO files were confirmed present.

## Recommended next steps

1. Deploy the changes to cPanel.
2. Confirm these URLs return the correct content after deployment:
   - `https://careercafe.co.ke/robots.txt`
   - `https://careercafe.co.ke/sitemap.xml`
   - `https://careercafe.co.ke/`
3. In Google Search Console, submit the sitemap.
4. Request indexing for `https://careercafe.co.ke/`.
5. Check Search Console for manual actions, security issues, coverage errors, and domain/canonical conflicts.
6. Confirm whether `careercafeafrica.com` should redirect to `careercafe.co.ke` or be configured as the primary domain.

Ranking recovery may take several days after Google recrawls the site. The observed behavior does not by itself prove a Google penalty.
