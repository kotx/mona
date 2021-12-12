import { chromium } from "playwright"

// TODO: choice between Chromium and Firefox

export async function screenshotPage(url: string, delay: number = 0) {
    const browser = await chromium.launch({ headless: true })
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    await page.goto(url, { waitUntil: "load" })
    await page.waitForLoadState("networkidle")

    if (delay > 0)
        await new Promise(resolve => setTimeout(resolve, delay))

    const screenshot = await page.screenshot({ fullPage: true })

    browser.close()
    return screenshot
}
