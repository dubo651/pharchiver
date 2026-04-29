const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { chromium } = require('playwright');

async function archive(url) {
    if (!url) {
        console.log('Usage: node index.js <URL>');
        process.exit(1);
    }

    let urlObj;
    try {
        urlObj = new URL(url);
    } catch (e) {
        console.error('Invalid URL provided.');
        process.exit(1);
    }

    const domain = urlObj.hostname.replace('www.', '').replace(/\./g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const folderName = `${timestamp}_${domain}`;
    const archiveDir = path.join(__dirname, '..', 'archives', folderName);

    await fs.ensureDir(archiveDir);

    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

    console.log(`\n🚀 Starting archive for: ${url}`);
    console.log(`📂 Destination: ${archiveDir}\n`);

    // 1. Capture Screenshot and Metadata using Playwright
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: userAgent,
        viewport: { width: 1280, height: 800 },
        extraHTTPHeaders: {
            'Referer': 'https://www.google.com/'
        }
    });
    const page = await context.newPage();

    try {
        console.log('🌐 Rendering page with Playwright...');
        await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
        
        // Wait a bit for any late-loading elements
        await page.waitForTimeout(2000);

        const title = await page.title();
        const screenshotPath = path.join(archiveDir, 'screenshot.png');
        
        console.log('📸 Capturing full-page screenshot...');
        await page.screenshot({ path: screenshotPath, fullPage: true });

        const metadata = {
            url,
            title,
            timestamp: new Date().toISOString(),
            userAgent: userAgent,
            referer: 'https://www.google.com/'
        };
        await fs.writeJson(path.join(archiveDir, 'metadata.json'), metadata, { spaces: 2 });

        await browser.close();

        // 2. Capture Single-File HTML using single-file-cli
        console.log('📄 Generating static HTML snapshot (SingleFile)...');
        const htmlPath = path.join(archiveDir, 'index.html');
        
        // Using optimized flags for archive.today-like behavior
        const sfFlags = [
            `--user-agent="${userAgent}"`,
            `--browser-wait-until=networkIdle`,
            `--compress-HTML=true`,
            `--remove-unused-styles=true`,
            `--remove-unused-fonts=true`,
            `--block-scripts=true`,
            `--load-deferred-images=true`
        ].join(' ');

        const sfCommand = `npx single-file "${url}" "${htmlPath}" ${sfFlags}`;
        
        execSync(sfCommand, { stdio: 'inherit' });

        console.log('\n✅ Archive Complete!');
        console.log(`🔗 HTML: ${path.relative(process.cwd(), htmlPath)}`);
        console.log(`🖼️  Screenshot: ${path.relative(process.cwd(), screenshotPath)}`);
        console.log(`📝 Metadata: ${path.relative(process.cwd(), path.join(archiveDir, 'metadata.json'))}\n`);

    } catch (error) {
        console.error('\n❌ Error during archiving:', error.message);
        if (browser) await browser.close();
    }
}

const targetUrl = process.argv[2];
archive(targetUrl);
