"""Browser regression checks. Session tokens arrive only through stdin, never files/logs."""
import json, sys
from playwright.sync_api import sync_playwright, expect

payload = json.load(sys.stdin)
base = 'http://localhost:3000'

def session_cookie(token):
    return {'name': 'authjs.session-token', 'value': token, 'url': base, 'httpOnly': True, 'sameSite': 'Lax'}

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp('http://localhost:9222')
    context = browser.contexts[0]
    original_cookies = context.cookies(base)
    context.add_cookies([session_cookie(payload['admin'])])
    page = context.new_page()
    participant = browser.new_context(viewport={'width': 390, 'height': 844})
    participant.add_cookies([session_cookie(payload['user'])])
    user_page = participant.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    user_page.on('pageerror', lambda e: errors.append(str(e)))
    game_url = base + '/?game=' + payload['gameId']
    try:
        page.goto(game_url)
        page.bring_to_front()
        expect(page.get_by_role('button', name='Управлять путём')).to_be_enabled(timeout=20000)
        expect(page.locator('[data-chakra]')).to_have_count(8)
        expect(page.locator('[data-interface-watermark]')).to_have_count(0)
        expect(page.locator('[data-board] .grid.grid-cols-2')).to_have_count(0)
        assert page.title().startswith('Leela')
        assert page.locator('[data-chakra]').evaluate_all('(els) => els.map(e => Number(e.dataset.chakra))') == [68, 59, 50, 41, 32, 23, 14, 5]
        page.get_by_role('button', name='Управлять путём').click()
        for i, cell in enumerate([11, 14, 50, 59]):
            page.get_by_role('spinbutton', name=f'Позиция путника {i+1}').fill(str(cell))
        page.get_by_role('button', name='Сохранить', exact=True).click()
        expect(page.get_by_role('dialog')).to_have_count(0)
        expect(page.locator('[data-player-token]')).to_have_count(4)
        for i, cell in enumerate([11, 14, 50, 59]):
            expect(page.locator(f'[data-player-token="{i}"]')).to_have_attribute('data-position', str(cell))
        page.wait_for_function("""() => [...document.querySelectorAll('[data-player-token]')].every(t => {
          const c=document.querySelector(`[data-cell="${t.dataset.position}"]`).getBoundingClientRect(), r=t.getBoundingClientRect();
          return Math.abs(r.x+r.width/2-c.x-c.width/2)<2 && Math.abs(r.y+r.height/2-c.y-c.height/2)<2;
        })""")
        colors = page.locator('[data-player-token]').evaluate_all("els => els.map(e => [getComputedStyle(e).filter, e.style.getPropertyValue('--orb-color')])")
        assert colors == [['brightness(1.4)', c] for c in ['#FFE4A3', '#67E99B', '#C5A3FF', '#FF9B4A']]
        print('PASS: поле, 8 чакр, положение и яркость 4 шариков; у администратора нет водяных знаков', flush=True)

        user_page.goto(game_url)
        user_page.bring_to_front()
        expect(user_page.locator('[data-player-token]')).to_have_count(4)
        expect(user_page.locator('[data-interface-watermark]')).to_have_count(1)
        expect(user_page.locator('[data-board] .grid.grid-cols-2')).to_have_count(1)
        expect(user_page.get_by_role('button', name='Управлять путём')).to_have_count(0)
        assert participant.request.get(base + '/api/cells').status == 403
        expect(user_page.locator('[data-cell="11"]')).to_be_disabled()
        expect(user_page.get_by_role('dialog')).to_have_count(0)
        assert user_page.locator('.content-protected').evaluate("e => !e.dispatchEvent(new Event('copy', {bubbles:true,cancelable:true}))")
        user_page.get_by_placeholder('1-6').fill('3')
        user_page.get_by_role('button', name='OK', exact=True).click()
        expect(user_page.locator('[data-player-token="0"]')).to_have_attribute('data-position', '14', timeout=12000)
        expect(user_page.get_by_role('button', name='OK', exact=True)).to_be_enabled()
        page.bring_to_front()
        expect(page.locator('[data-player-token="0"]')).to_have_attribute('data-position', '14', timeout=12000)

        # Repeated edits ensure the observer refreshes more than once.
        for target in [41, 50]:
            page.get_by_role('button', name='Управлять путём').click()
            page.get_by_role('spinbutton', name='Позиция путника 1').fill(str(target))
            page.get_by_role('button', name='Сохранить', exact=True).click()
            expect(page.get_by_role('dialog')).to_have_count(0)
            user_page.bring_to_front()
            expect(user_page.locator('[data-player-token="0"]')).to_have_attribute('data-position', str(target), timeout=12000)
            page.bring_to_front()
        page.get_by_role('button', name='Управлять путём').click()
        page.get_by_role('checkbox', name='Поставить путь на паузу').check()
        page.get_by_role('button', name='Сохранить', exact=True).click()
        expect(page.get_by_role('dialog')).to_have_count(0)
        user_page.bring_to_front()
        expect(user_page.get_by_text('Путь на паузе.', exact=False)).to_be_visible(timeout=12000)
        expect(user_page.get_by_role('button', name='OK', exact=True)).to_have_count(0)
        print('PASS: ход участника виден администратору; повторные коррекции и пауза видны участнику; защита сохранена', flush=True)

        page.bring_to_front()
        page.get_by_role('button', name='Назад', exact=True).click()
        expect(page.get_by_role('heading', name='Сохранённые пути')).to_be_visible()
        page.get_by_role('textbox', name='Поиск сохранённых путей').fill('Проверка интерфейса Leela')
        card = page.locator('article').filter(has=page.get_by_role('heading', name='Проверка интерфейса Leela', exact=True))
        expect(card).to_have_count(1)
        card.get_by_role('button', name='Изменить', exact=True).click()
        page.get_by_label('Название пути', exact=True).fill('Проверка интерфейса — сохранено')
        page.get_by_role('button', name='Сохранить', exact=True).click()
        expect(page.get_by_role('dialog')).to_have_count(0)
        page.get_by_role('textbox', name='Поиск сохранённых путей').fill('Проверка интерфейса — сохранено')
        card = page.locator('article').filter(has=page.get_by_role('heading', name='Проверка интерфейса — сохранено', exact=True))
        expect(card).to_have_count(1)
        card.get_by_role('button', name='Открыть на поле', exact=True).click()
        expect(page.locator('[data-player-token="0"]')).to_have_attribute('data-position', '50')
        page.goto(base + '/admin?tab=games')
        page.get_by_role('combobox', name='Игра участника', exact=True).select_option(payload['gameId'])
        expect(page.get_by_role('button').filter(has_text='Коррекция · 14 → 41')).to_be_visible()
        assert 'кубик 0' not in page.inner_text('body')
        page.get_by_role('textbox', name='Поиск сохранённых путей').fill('Проверка интерфейса — сохранено')
        card = page.locator('article').filter(has=page.get_by_role('heading', name='Проверка интерфейса — сохранено', exact=True))
        card.get_by_role('button', name='Удалить', exact=True).click()
        expect(page.get_by_role('button', name='Удалить путь', exact=True)).to_be_disabled()
        page.get_by_label('Введите «Удалить» для подтверждения').fill('Удалить')
        page.get_by_role('button', name='Удалить путь', exact=True).click()
        expect(page.get_by_role('dialog')).to_have_count(0)
        expect(card).to_have_count(0)
        print('PASS: назад, поиск, изменение, повторное открытие, корректная история и подтверждённое удаление тестового пути', flush=True)

        page.goto(base + '/')
        expect(page.get_by_role('heading', name='Начало Пути')).to_be_visible()
        assert 'Настройте игру' not in page.inner_text('body')
        assert 'Игра для пары — два путника' not in page.inner_text('body')
        for number in ['1', '2', '3', '4']:
            expect(page.get_by_role('button', name=number, exact=True)).to_be_visible()
        page.get_by_role('button', name='Leela — быстрое меню').click()
        expect(page.get_by_role('menuitem', name='Игры участников', exact=True)).to_be_visible()
        page.get_by_role('menuitem', name='Сохранённые пути', exact=True).click()
        expect(page.get_by_role('heading', name='Сохранённые пути')).to_be_visible()
        # Registration redirects signed-in users, so verify it as a visitor.
        context.clear_cookies(name='authjs.session-token')
        page.goto(base + '/signup')
        expect(page.get_by_text('Встреча с собой', exact=True)).to_be_visible()
        expect(page.get_by_text('by Ekaterina Faizieva', exact=True)).to_be_visible()
        expect(page.get_by_role('button', name='Назад', exact=True)).to_be_visible()
        assert not errors, errors
        print('PASS: меню Leela, стрелки назад, оформление регистрации и выбор 1–4; ошибок браузера нет', flush=True)
    finally:
        page.close()
        participant.close()
        context.clear_cookies(name='authjs.session-token')
        restore = [c for c in original_cookies if c['name'] == 'authjs.session-token']
        if restore:
            context.add_cookies(restore)
