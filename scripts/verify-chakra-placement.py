import json, sys
from playwright.sync_api import sync_playwright, expect

payload = json.load(sys.stdin)
with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp('http://localhost:9222')
    context = browser.new_context(viewport={'width': 1440, 'height': 1000})
    context.add_cookies([{'name': 'authjs.session-token', 'value': payload['token'], 'url': 'http://localhost:3000', 'httpOnly': True, 'sameSite': 'Lax'}])
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    try:
        page.goto('http://localhost:3000/?game=' + payload['gameId'])
        expect(page.locator('[data-chakra]')).to_have_count(8, timeout=25000)
        page.wait_for_function("() => {const i=document.querySelector('[data-board] img'); return i && i.complete && i.naturalWidth > 0}")
        page.locator('[data-board]').screenshot(path='board-corrected.png')
        expected_y = [383.75, 550.25, 713, 875, 1039, 1203.5, 1363.5]
        expected_colors = ['rgb(74, 14, 23)'] * 7
        for width in [1440, 390]:
            page.set_viewport_size({'width': width, 'height': 1000})
            values = page.locator('[data-chakra]').evaluate_all('''els => {
              const b=document.querySelector('[data-board]').getBoundingClientRect();
              return els.map(e => { const r=e.getBoundingClientRect(); return {y:(r.y+r.height/2-b.y)/b.height*1536,x:(r.x+r.width/2-b.x)/b.width*2048,color:getComputedStyle(e).color, pointer:getComputedStyle(e).pointerEvents}; });
            }''')
            for i, item in enumerate(values[1:]):
                assert abs(item['y'] - expected_y[i]) < 1, (width, i, item)
                assert abs(item['x'] - 1023.75) < 1
                assert item['color'] == expected_colors[i]
                assert item['pointer'] == 'none'
            assert abs(values[0]['y'] - 216.5) < 1
        assert not errors, errors
        print('PASS: на игровом поле семь бордовых чакр расположены в центрах клеток 59/50/41/32/23/14/5; цвета и положение сохраняются на широком и узком экране; белый свет не перемещён; клики не перекрываются')
    finally:
        context.close()
