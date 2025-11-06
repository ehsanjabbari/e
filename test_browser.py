#!/usr/bin/env python3
import asyncio
import sys
import os
from playwright.async_api import async_playwright

async def test_inventory_app():
    """تست برنامه مدیریت موجودی در مرورگر"""
    async with async_playwright() as p:
        # Launch browser headless
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 720})
        page = await context.new_page()
        
        # Navigate to the app
        await page.goto('http://localhost:8000')
        await page.wait_for_load_state('networkidle')
        
        print("🔍 تست 1: بارگیری صفحه اصلی")
        
        # Test 1: Check if page loads
        title = await page.title()
        if "مدیریت موجودی" in title:
            print("✅ عنوان صفحه صحیح")
        else:
            print("❌ عنوان صفحه نادرست")
            
        # Test 2: Check if settings tab exists and can be clicked
        print("\n🔍 تست 2: تب تنظیمات")
        try:
            settings_tab = await page.wait_for_selector('[data-tab="settings"]', timeout=5000)
            await settings_tab.click()
            await page.wait_for_timeout(1000)
            print("✅ تب تنظیمات باز شد")
        except Exception as e:
            print(f"❌ خطا در باز کردن تب تنظیمات: {e}")
            
        # Test 3: Check GitHub integration form
        print("\n🔍 تست 3: فرم GitHub Integration")
        try:
            # Check if GitHub token input exists
            token_input = await page.wait_for_selector('#github-token', timeout=3000)
            print("✅ فیلد توکن GitHub موجود")
            
            # Check if Gist ID input exists
            gist_input = await page.query_selector('#github-gist-id')
            if gist_input:
                print("✅ فیلد Gist ID موجود")
            else:
                print("❌ فیلد Gist ID یافت نشد")
                
        except Exception as e:
            print(f"❌ خطا در پیدا کردن فرم GitHub: {e}")
            
        # Test 4: Test JavaScript console for errors
        print("\n🔍 تست 4: بررسی خطاهای Console")
        console_errors = []
        
        def handle_console(msg):
            if msg.type == 'error':
                console_errors.append(msg.text)
                
        page.on('console', handle_console)
        
        # Check for any JavaScript errors in console
        await page.wait_for_timeout(2000)
        
        if console_errors:
            print("❌ خطاهای JavaScript یافت شد:")
            for error in console_errors:
                print(f"  - {error}")
        else:
            print("✅ هیچ خطای JavaScript یافت نشد")
            
        # Test 5: Test GitHub settings save function
        print("\n🔍 تست 5: تابع ذخیره تنظیمات GitHub")
        try:
            await page.fill('#github-token', 'test-token-12345')
            await page.click('button[onclick="saveGitHubSettings()"]')
            await page.wait_for_timeout(1000)
            
            # Check if notification appears
            notification = await page.query_selector('.notification, .toast, .alert')
            if notification:
                print("✅ تابع ذخیره تنظیمات اجرا شد")
            else:
                print("⚠️ تابع ذخیره تنظیمات اجرا شد اما notification یافت نشد")
                
        except Exception as e:
            print(f"❌ خطا در تست ذخیره تنظیمات: {e}")
            
        # Test 6: Test navigation between tabs
        print("\n🔍 تست 6: ناوبری بین تب‌ها")
        try:
            # Test products tab
            products_tab = await page.wait_for_selector('[data-tab="products"]', timeout=3000)
            await products_tab.click()
            await page.wait_for_timeout(500)
            
            # Test input invoices tab  
            input_tab = await page.wait_for_selector('[data-tab="input-invoices"]', timeout=3000)
            await input_tab.click()
            await page.wait_for_timeout(500)
            
            # Test sales tab
            sales_tab = await page.wait_for_selector('[data-tab="sales-151"]', timeout=3000)
            await sales_tab.click()
            await page.wait_for_timeout(500)
            
            print("✅ ناوبری بین تب‌ها صحیح")
            
        except Exception as e:
            print(f"❌ خطا در ناوبری بین تب‌ها: {e}")
            
        # Generate test report
        print("\n" + "="*50)
        print("📊 گزارش تست کامل:")
        print("="*50)
        print(f"عنوان صفحه: {title}")
        print(f"تعداد خطاهای Console: {len(console_errors)}")
        if console_errors:
            print("جزئیات خطاها:")
            for error in console_errors:
                print(f"  - {error}")
        else:
            print("✅ هیچ خطای Console یافت نشد")
            
        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_inventory_app())