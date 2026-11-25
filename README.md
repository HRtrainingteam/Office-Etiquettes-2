# SMC Office Etiquettes Peer Rating — Version 2

A responsive peer-rating portal for 20 employees. Each participant selects their own name, enters their employee code, and rates the other 19 colleagues across five behaviours (1–5 stars). The selected submitter is excluded from their own rating list.

## Rating categories
1. Punctuality
2. Respectful Behaviour
3. Acts with Integrity
4. Appropriate Dressing & Professional Appearance
5. Team Collaboration

## Publish with GitHub Pages
1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select **main** and **/(root)**, then Save.
4. Wait for GitHub Pages to publish the site. The URL will be shown in Settings → Pages.

## Connect Google Sheets
The repository includes `google-apps-script.gs` as the receiver script. The website is configured to send submissions to the new Apps Script deployment supplied for this version.

1. Create a Google Sheet for the results.
2. In that Sheet, choose **Extensions → Apps Script**.
3. Replace the editor contents with the code in `google-apps-script.gs`, then Save.
4. Choose **Deploy → New deployment → Web app**.
5. Set **Execute as: Me**. For access, choose the narrowest option that allows your intended raters. If your organisation option is available, prefer it; otherwise, **Anyone** may be required for a public portal.
6. Deploy and copy the Web app URL ending in `/exec`.
7. The `index.html` in this repository is already configured with the new deployed Web app URL. If you redeploy Apps Script later, update `GOOGLE_SCRIPT_URL` with the new `/exec` URL.
8. Open the published GitHub Pages site and test with a test submission. Confirm the rows appear in the Sheet before circulating the link.

Each submission creates 19 rows, one for each colleague rated, with the submitter name, employee code, timestamp and five category scores.

## Important notes
- Employee code is required and recorded, but this starter version does **not** verify that the code belongs to the selected name. To enforce identity, add a private server-side employee-code/name validation list before launch.
- The website prevents self-rating in its interface and the Apps Script receiver also rejects a self-rating.
- Do not publish employee codes or rating data in this GitHub repository. Keep the response spreadsheet private and share it only with authorised HR/L&D users.
- This starter version does not block repeat submissions. Add a server-side duplicate-submission policy if only one response per employee is permitted.
- If the Google Sheets endpoint has not been configured, submissions are not sent to Sheets. Configure it and test before sharing the portal.
