# Google Search Console setup

Webmers already publishes the two crawl files Google needs:

- `https://YOUR_DOMAIN/robots.txt`
- `https://YOUR_DOMAIN/sitemap.xml`

## Verify the domain

1. In Google Search Console, add the production `https://` URL-prefix property.
2. Choose **HTML tag** verification and copy the `content` value from Google's tag.
3. Set it as `GOOGLE_SITE_VERIFICATION` in the production environment, then redeploy. The app emits the required `google-site-verification` meta tag automatically.
4. Click **Verify** in Search Console.
5. Submit `https://YOUR_DOMAIN/sitemap.xml` in the Sitemaps report.

For a Domain property, use DNS verification in your DNS provider instead. Do not commit a Google verification token or a DNS credential to the repository.
