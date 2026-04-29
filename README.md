# Pharchiver
> An archiver imitate the mechanism of the webpage archiving website arch##ive.ph, responding to the shutdown from the original site from time to time.

## Get started

**Note**: Nodejs and playwright are needed for this.

1. Clone and change directory to it:

```bash
git clone https://github.com/dubo651/pharchiver.git
cd pharchiver
```

2. Install dependencies:

```bash
npm install
```

3. Install Chromium (from playwright, just the core):

```bash
npx playwright install chromium
```

4. Begin archiving:

```bash
node index.js "YOUR URL HERE"
```

## Mechanism for this:

- **Headless Rendering:** Uses Playwright to render JS-heavy pages.
- **Standalone HTML:** Inlines CSS, fonts, and images (Base64) into a single file.
- **Safe & Static:** Strips all JavaScript and tracking scripts.
- **Visual Backup:** Captures a full-page screenshot.
- (Some other features may not listed)

Thanks, and enjoy. If you have any problems, do not wait to contact me via email.
