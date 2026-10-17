# FBI Wanted — Yemot HaMashiach API

Vercel serverless endpoint that reads public FBI Wanted records and returns Yemot-compatible `read=` responses. Descriptions are translated to Hebrew through Google's public web translation endpoint; this unofficial endpoint can be rate-limited and may fall back to English.

## Deploy
1. Import this repository into Vercel.
2. Deploy with the default settings (Node.js 18+).
3. Endpoint: `https://YOUR-PROJECT.vercel.app/api/yemot`

## Query examples
- Menu: `/api/yemot`
- List: `/api/yemot?choice=1`
- Ten Most Wanted category: `/api/yemot?choice=2`
- Search by name: `/api/yemot?choice=3&name=John%20Doe`
- Next page: `/api/yemot?choice=5&page=1`
- Field office: `/api/yemot?choice=4&field_offices=miami`

The endpoint returns plain text in Yemot's `read=...` format. FBI data is public and does not require a secret API key. Always verify information against the official FBI record.
