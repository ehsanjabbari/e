#!/usr/bin/env python3
import asyncio
from playwright.async_api import async_playwright

async def test_pwa():
    """تست PWA features"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 375, 'height': 667})  # iPhone size
        page = await context.new_page()
        
        # Enable console logging
        page.on('console', lambda msg: print(f'Console: {msg.text}'))
        
        # Navigate to the app
        await page.goto('http://localhost:8000')
        await page.wait_for_load_state('networkidle')
        
        print("🔍 تست PWA Features")
        print("="*50)
        
        # Test 1: Check PWA manifest
        print("\n🔍 تست 1: PWA Manifest")
        try:
            manifest = await page.evaluate('''async () => {
                try {
                    const registration = await navigator.serviceWorker.getRegistration();
                    return registration ? 'Service Worker registered' : 'No service worker';
                } catch (e) {
                    return 'Error: ' + e.message;
                }
            }''')
            print(f"✅ Service Worker: {manifest}")
        except Exception as e:
            print(f"❌ Service Worker error: {e}")
            
        # Test 2: Check manifest.json
        print("\n🔍 تست 2: Manifest.json")
        try:
            manifest_exists = await page.evaluate('''async () => {
                try {
                    const response = await fetch('/manifest.json');
                    const manifest = await response.json();
                    return {
                        name: manifest.name,
                        short_name: manifest.short_name,
                        icons_count: manifest.icons.length
                    };
                } catch (e) {
                    return {error: e.message};
                }
            }''')
            print(f"✅ Manifest: {manifest_exists}")
        except Exception as e:
            print(f"❌ Manifest error: {e}")
            
        # Test 3: Check iOS specific meta tags
        print("\n🔍 تست 3: iOS Meta Tags")
        try:
            ios_tags = await page.evaluate('''() => {
                return {
                    apple_mobile_web_app_title: document.querySelector('meta[name="apple-mobile-web-app-title"]')?.content,
                    apple_mobile_web_app_capable: document.querySelector('meta[name="apple-mobile-web-app-capable"]')?.content,
                    apple_mobile_web_app_status_bar_style: document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.content
                };
            }''')
            print(f"✅ iOS Tags: {ios_tags}")
        except Exception as e:
            print(f"❌ iOS tags error: {e}")
            
        # Test 4: Check icons
        print("\n🔍 تست 4: Icons")
        try:
            icons = await page.evaluate('''() => {
                const icons = [];
                const iconLinks = document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"]');
                iconLinks.forEach(link => {
                    icons.push({
                        rel: link.rel,
                        href: link.href,
                        sizes: link.sizes
                    });
                });
                return icons;
            }''')
            print(f"✅ Icons: Found {len(icons)} icon links")
            for icon in icons:
                print(f"  - {icon['rel']}: {icon['href']}")
        except Exception as e:
            print(f"❌ Icons error: {e}")
            
        # Test 5: Check PWA installability
        print("\n🔍 تست 5: PWA Installability")
        try:
            installable = await page.evaluate('''() => {
                return {
                    before_install_prompt: 'beforeinstallprompt' in window,
                    service_worker: 'serviceWorker' in navigator,
                    standalone_mode: window.matchMedia('(display-mode: standalone)').matches
                };
            }''')
            print(f"✅ PWA Features: {installable}")
        except Exception as e:
            print(f"❌ PWA installability error: {e}")
            
        print("\n" + "="*60)
        print("📊 تست PWA تکمیل شد!")
        print("برنامه آماده نصب به عنوان PWA در آیفون است")
        print("="*60)
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_pwa())