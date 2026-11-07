import { expect, test, type Page, type Locator } from "@playwright/test";

async function checkPointers(page: Page) {
  const failures = await page
    .locator(
      'a[href], button, select, [role="option"], [role="radio"], [role="switch"], [role^="menuitem"], [role="tab"]',
    )
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            !element.matches(
              ':disabled, [aria-disabled="true"], [data-disabled]',
            ) &&
            getComputedStyle(element).cursor !== "pointer"
          );
        })
        .map((element) => element.outerHTML.slice(0, 200)),
    );
  expect(failures).toEqual([]);
}

async function checkModalType(dialog: Locator) {
  await expect(dialog.locator(".header-drawer-title")).toHaveCSS(
    "font-size",
    "20px",
  );
  const incorrect = await dialog.evaluate((root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const failures = [];
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (
        !node.textContent?.trim() ||
        !parent ||
        parent.closest(".header-drawer-title, svg")
      )
        continue;
      const size = getComputedStyle(parent).fontSize;
      if (size !== "14px") failures.push({ text: node.textContent, size });
    }
    return failures;
  });
  expect(incorrect).toEqual([]);
  for (const minutes of await dialog
    .locator(
      ".service-option-span-min-2, .sheet-body-p-eta-label .minute-number",
    )
    .all()) {
    await expect(minutes).toHaveCSS("font-family", /Inter/i);
  }
}

async function open(page: Page, path: string) {
  await page.goto(path);
  if (path !== "/story") {
    // Client-side controls are ready after the store persists its initial state.
    await page.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("dashhour:v2") || "{}").settings !=
        null,
    );
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "dashhour:v2",
      JSON.stringify({
        onboarded: true,
        lang: "ko",
        clock: { realStart: Date.now(), simStart: 632, speed: 0 },
      }),
    );
  });
});

test("ticket cards respond across both halves and keep independent controls", async ({
  page,
}) => {
  await open(page, "/");
  const cards = page.locator(".desktop-list .stub-card");
  await expect(cards.first()).toBeVisible();
  await checkPointers(page);
  const second = cards.nth(1);
  const action = second.locator(".stub-card-action");
  const name = await action.getAttribute("aria-label");
  const box = (await second.boundingBox())!;
  for (const y of [24, box.height - 16]) {
    expect(
      await page.evaluate(
        ({ x, y }) => getComputedStyle(document.elementFromPoint(x, y)!).cursor,
        { x: box.x + 28, y: box.y + y },
      ),
    ).toBe("pointer");
  }
  // Clicking the queue text in the bottom half selects this branch.
  await page.mouse.click(box.x + 28, box.y + box.height - 16);
  await expect(action).toHaveAttribute("aria-current", "true");
  await expect(page.locator(".branch-panel-name")).toContainText(
    name!.split(" ").at(-1)!,
  );
  const favorite = second.getByRole("button", { name: /즐겨찾기/ });
  const pressed = await favorite.getAttribute("aria-pressed");
  await favorite.click();
  await expect(
    page.locator('.stub-card-action[aria-current="true"]'),
  ).toHaveAttribute("aria-label", name!);
  await expect(
    page
      .getByRole("button", {
        name: pressed === "true" ? /즐겨찾기 추가/ : /즐겨찾기 해제/,
      })
      .first(),
  ).toBeVisible();
});

test("hover, pressed, selected and keyboard focus states remain distinct", async ({
  page,
}) => {
  await open(page, "/");
  const card = page.locator(".desktop-list .stub-card").nth(1);
  const surfaces = () =>
    card.locator(".stub-card-top, .stub-card-bottom").evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return { background: style.backgroundColor, border: style.borderColor };
      }),
    );
  const initialSurfaces = await surfaces();
  const initial = await card.evaluate((e) => getComputedStyle(e).filter);
  await card.hover();
  await expect(card).toHaveCSS("--ticket-glow-blur", "8px");
  await expect
    .poll(() => card.evaluate((e) => getComputedStyle(e).filter))
    .not.toBe(initial);
  expect(await surfaces()).toEqual(initialSurfaces);
  const hover = await card.evaluate((e) => getComputedStyle(e).filter);
  await page.mouse.down();
  await expect(card).toHaveCSS("--ticket-glow-color", "rgb(21 26 79 / 0.3)");
  await expect
    .poll(() => card.evaluate((e) => getComputedStyle(e).filter))
    .not.toBe(hover);
  expect(await surfaces()).toEqual(initialSurfaces);
  await page.mouse.up();
  await page.mouse.move(900, 30);
  await expect(card).toHaveAttribute("data-selected", "true");
  await expect(card).toHaveCSS("--ticket-glow-blur", "10px");
  await expect
    .poll(() => card.evaluate((e) => getComputedStyle(e).filter))
    .not.toBe(initial);
  expect(await surfaces()).toEqual(initialSurfaces);
  await page.keyboard.press("Tab");
  await card.locator(".stub-card-action").focus();
  await expect(card.locator(".stub-card-action")).toHaveCSS(
    "outline-width",
    "2px",
  );
});

test("sidebar details link spans the panel and minute labels are compact", async ({
  page,
}) => {
  await open(page, "/");
  const panel = page.locator(".branch-panel");
  const details = page.getByRole("link", { name: "지점 상세 보기" });
  await details.scrollIntoViewIfNeeded();
  const panelBox = (await panel.boundingBox())!;
  const linkBox = (await details.boundingBox())!;
  expect(Math.abs(linkBox.x - panelBox.x)).toBeLessThanOrEqual(1);
  expect(
    Math.abs(linkBox.x + linkBox.width - panelBox.x - panelBox.width),
  ).toBeLessThanOrEqual(1);
  expect(
    Math.abs(linkBox.y + linkBox.height - panelBox.y - panelBox.height),
  ).toBeLessThanOrEqual(1);
  await expect(details).toHaveCSS("border-top-width", "0px");
  const defaultBackground = await details.evaluate(
    (e) => getComputedStyle(e).backgroundColor,
  );
  expect(defaultBackground).not.toBe("rgb(255, 255, 255)");
  const time = panel.locator(".crowd-chart-text");
  for (const label of await panel.locator(".crowd-chart-svg text").all()) {
    await expect(label).toHaveCSS("font-size", "10px");
  }
  await expect(time.locator("..").locator("rect")).toHaveAttribute(
    "height",
    "16",
  );
  await details.hover();
  await expect
    .poll(() => details.evaluate((e) => getComputedStyle(e).backgroundColor))
    .not.toBe(defaultBackground);
  await expect(details).toHaveCSS("cursor", "pointer");
  const wait = page.locator(".desktop-list .card-wait").first();
  await expect(wait).toHaveCSS("gap", "0px");
  await expect(wait.locator(".minute-number")).toHaveCSS(
    "font-family",
    /Inter/i,
  );
  const number = (await wait.locator(".minute-number").boundingBox())!;
  const unit = (await wait.locator(".card-wait-unit").boundingBox())!;
  expect(Math.abs(unit.x - number.x - number.width)).toBeLessThan(0.1);
  await expect(
    page.locator(".desktop-list .take-ticket-button").first(),
  ).toHaveCSS("font-size", "13px");
  await details.click();
  await expect(page).toHaveURL(/\/branch\//);
});

test("ticket sheet controls and issuing, delay and cancellation flows work", async ({
  page,
}) => {
  await open(page, "/");
  await page.locator(".desktop-list .take-ticket-button").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await checkModalType(dialog);
  await checkPointers(page);
  const radios = dialog.getByRole("radio");
  for (const [index, row] of (await radios.all()).entries()) {
    await expect(row).toHaveCSS("padding-left", "0px");
    await expect(row).toHaveCSS("padding-right", "0px");
    await expect(row).toHaveCSS("box-shadow", "none");
    await expect(row).toHaveCSS("border-left-width", "0px");
    await expect(row).toHaveCSS(
      "border-top-width",
      index === 0 ? "0px" : "1px",
    );
  }
  await expect(dialog.locator(".sheet-confirm-icon")).toBeVisible();
  await radios.nth(1).click();
  await expect(radios.nth(1)).toHaveCSS("box-shadow", "none");
  for (const value of await dialog.locator(".sheet-time-value").all()) {
    await expect(value).toHaveCSS("font-size", "14px");
    await expect(value).toHaveCSS("font-weight", "500");
    for (const number of await value.locator(".minute-number").all())
      await expect(number).toHaveCSS("font-family", /Inter/i);
  }
  await expect(radios.nth(1)).toBeChecked();
  const toggle = dialog.getByRole("switch");
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await dialog.getByRole("button", { name: "번호표 받기" }).click();
  await expect(page).toHaveURL(/\/ticket$/, { timeout: 10000 });
  await expect(page.locator(".ticket-stub-div-cancel-ticket")).toBeVisible();
  await checkPointers(page);
  await page.getByRole("button", { name: /순번 미루기/ }).click();
  await expect(
    page.getByRole("button", { name: /순번 미루기/ }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "번호표 취소", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await checkPointers(page);
});

test("mobile list rows open the branch and layouts fit small screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/");
  const row = page.locator(".branch-row").filter({ visible: true }).first();
  const href = await row.getAttribute("href");
  const box = (await row.boundingBox())!;
  // The whole row is one link: clicking the wait time on the right opens it.
  await page.mouse.click(box.x + box.width - 12, box.y + box.height - 12);
  await expect(page).toHaveURL(new RegExp(href!));
  for (const route of ["/", "/map", "/ticket", "/me", "/story"]) {
    await open(page, route);
    await checkPointers(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("search, menu, filters and account switches retain their CSS states", async ({
  page,
}) => {
  await open(page, "/");
  const filter = page
    .locator(".desktop-list")
    .getByRole("button", { name: "주차", exact: true });
  await filter.click();
  await expect(filter).toHaveAttribute("data-pressed");
  // Desktop filters are text toggles: a light navy tint only when switched on.
  await expect(filter).toHaveCSS("background-color", "rgb(230, 232, 244)");
  await expect(filter).toHaveCSS("color", "rgb(21, 26, 79)");
  await page
    .getByRole("button", { name: "은행 또는 지점 검색" })
    .filter({ visible: true })
    .click();
  await page.getByRole("textbox").fill("강남");
  await checkPointers(page);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "옵션" })
    .filter({ visible: true })
    .click();
  await expect(page.getByRole("menu")).toBeVisible();
  await checkPointers(page);
  await page.keyboard.press("Escape");
  await open(page, "/me");
  const toggle = page.getByRole("switch").first();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await checkPointers(page);
});

test("responsive layouts, intro and story toggles survive the CSS migration", async ({
  page,
}) => {
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await open(page, "/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator(".desktop-explorer")).toBeVisible({
      visible: width >= 1024,
    });
  }
  await open(page, "/me");
  await page.getByRole("button", { name: "소개 다시 보기" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await checkPointers(page);
  await page.getByRole("button", { name: "건너뛰기" }).click();
  await page.locator(".me-screen-link-about-project").click();
  await expect(page).toHaveURL(/\/story$/);
  const toggle = page.getByRole("switch").first();
  await toggle.click();
  await expect(toggle).toBeChecked();
  await checkPointers(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/");
  expect(
    await page
      .locator(".desktop-list .stub-card")
      .first()
      .evaluate((e) => parseFloat(getComputedStyle(e).transitionDuration)),
  ).toBeLessThan(0.01);
});

for (const width of [1440, 390]) {
  test(`stacked toasts stay readable and separated at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    // Phone list rows have no star, so on phones the branch page's copy-address
    // button raises the toasts (the hero star sits under the toast stack).
    await open(page, width >= 1024 ? "/" : "/branch/shinhan-gangnam");
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 100));
    const favorite =
      width >= 1024
        ? page.locator(".desktop-list .card-favorite").first()
        : page.getByRole("button", { name: "복사" }).filter({ visible: true });
    for (let i = 0; i < 3; i++) await favorite.click();
    const toasts = page.locator(
      ".toast-card:not([data-ending-style]):not([data-limited])",
    );
    await expect(toasts).toHaveCount(3);
    const checkStack = async () => {
      const bounds = await toasts.evaluateAll((elements) =>
        elements
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              top: rect.top,
              bottom: rect.bottom,
              left: rect.left,
              right: rect.right,
            };
          })
          .sort((a, b) => a.top - b.top),
      );
      for (let i = 1; i < bounds.length; i++)
        expect(bounds[i].top - bounds[i - 1].bottom).toBeGreaterThanOrEqual(11);
      for (const rect of bounds) {
        expect(rect.left).toBeGreaterThanOrEqual(0);
        expect(rect.right).toBeLessThanOrEqual(width);
      }
    };
    await expect(async () => checkStack()).toPass();
    for (const content of await toasts
      .locator(".toast-list-toast-content")
      .all())
      await expect(content).toHaveCSS("opacity", "1");
    await toasts.nth(1).hover();
    await expect(async () => checkStack()).toPass();
    await toasts.nth(1).getByRole("button", { name: "Close" }).click();
    await page.clock.runFor(600);
    await expect(toasts).toHaveCount(2);
    await expect(async () => checkStack()).toPass();
  });
}

test("first ticket has space for its glow above the scrollable list", async ({
  page,
}) => {
  await open(page, "/");
  const list = page.locator(".desktop-list-cards");
  const first = list.locator(".stub-card").first();
  await first.hover();
  const listBox = (await list.boundingBox())!;
  const cardBox = (await first.boundingBox())!;
  expect(cardBox.y - listBox.y).toBeGreaterThanOrEqual(20);
  await expect(list).toHaveCSS("overflow-y", "auto");
});

test("bank filtering combines with facilities, sorting and clear filters", async ({
  page,
}) => {
  await open(page, "/");
  const list = page.locator(".desktop-list");
  const bank = list.getByRole("combobox", { name: "은행 선택" });
  const cards = list.locator(".stub-card");
  const total = await cards.count();
  await expect(bank).toHaveCSS("cursor", "pointer");
  await bank.click();
  await page.getByRole("option", { name: "하나은행", exact: true }).click();
  await expect(cards).toHaveCount(2);
  for (const name of await cards.locator(".card-bank-name").all())
    await expect(name).toContainText("하나은행");
  await expect(page.locator(".branch-panel-bank")).toHaveText("하나은행");
  await list.getByRole("button", { name: "가까운 순", exact: true }).click();
  await expect(bank).toContainText("하나은행");
  await expect(cards.first().locator(".card-branch-name")).toHaveText(
    "역삼동점",
  );
  await list.getByRole("button", { name: "주차", exact: true }).click();
  await expect(cards).toHaveCount(1);
  await expect(cards.first().locator(".card-branch-name")).toHaveText(
    "강남대로점",
  );
  await bank.click();
  await page.getByRole("option", { name: "IBK기업은행", exact: true }).click();
  await expect(cards).toHaveCount(0);
  await expect(list.getByText("조건에 맞는 지점이 없습니다")).toBeVisible();
  await list.locator(".empty-filters-button-clear-filters").click();
  await expect(bank).toContainText("전체 은행");
  await expect(cards).toHaveCount(total);
  await expect(
    list.getByRole("button", { name: "주차", exact: true }),
  ).not.toHaveAttribute("data-pressed");
  await bank.click();
  await page.getByRole("option", { name: "하나은행", exact: true }).click();
  await page
    .getByRole("button", { name: "옵션" })
    .filter({ visible: true })
    .click();
  await page
    .getByRole("menuitemradio", { name: "English", exact: true })
    .click();
  await expect(
    list.getByRole("combobox", { name: "Choose bank" }),
  ).toContainText("Hana Bank");
  await expect(cards).toHaveCount(2);
  await expect(cards.first().locator(".card-wait")).toContainText("About");
});

test("sidebar typography, icons and chart divider match the refined design", async ({
  page,
}) => {
  await open(page, "/");
  const card = page.locator(".desktop-list .stub-card").first();
  for (const selector of [
    ".card-wait",
    ".card-wait-number",
    ".card-wait-unit",
    ".card-queue",
  ]) {
    await expect(card.locator(selector)).toHaveCSS("font-size", "13px");
    await expect(card.locator(selector)).toHaveCSS("font-weight", "400");
  }
  await expect(card.locator(".card-wait")).toContainText(/약\s*\d+분/);
  await expect(card.locator(".card-wait .lucide-clock")).toBeVisible();
  await expect(card.locator(".card-queue .lucide-users")).toBeVisible();
  expect(
    (await card.locator(".card-content").last().innerText()).match(/대기/g),
  ).toHaveLength(1);
  await expect(card.locator(".take-ticket-button")).toHaveCSS(
    "font-weight",
    "500",
  );
  await expect(card.locator(".favorite-icon")).toHaveCSS("width", "18px");
  await expect(page.locator(".branch-panel .favorite-icon")).toHaveCSS(
    "width",
    "18px",
  );
  await expect(page.locator(".branch-panel .crowd-chart-text")).toHaveCSS(
    "font-weight",
    "400",
  );
  await expect(page.locator(".branch-panel-services")).toHaveCSS(
    "border-bottom-width",
    "0px",
  );
  const details = page.locator(".branch-panel-details");
  await expect(details).toHaveCSS("background-color", "rgb(21, 26, 79)");
  await expect(details).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(details).toHaveCSS("position", "sticky");
});

test("ticket service rows and timing text fit the mobile modal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/");
  await page.locator(".take-ticket-button:visible").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await checkModalType(dialog);
  const rows = dialog.getByRole("radio");
  await rows.nth(1).click();
  await expect(rows.nth(1)).toBeChecked();
  const sizes = await dialog
    .locator(".sheet-time-value")
    .evaluateAll((elements) =>
      elements.map((e) => getComputedStyle(e).fontSize),
    );
  expect(sizes).toEqual(["14px", "14px"]);
  for (const value of await dialog.locator(".sheet-time-value").all())
    expect(await value.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(
      true,
    );
  await expect(
    dialog.getByRole("button", { name: "번호표 받기" }).locator("svg"),
  ).toBeVisible();
  expect(await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(
    true,
  );
});

test("English service choices use color-only states and smaller radio circles", async ({
  page,
}) => {
  await open(page, "/");
  await page
    .getByRole("button", { name: "옵션" })
    .filter({ visible: true })
    .click();
  await page
    .getByRole("menuitemradio", { name: "English", exact: true })
    .click();
  await page.locator(".desktop-list .take-ticket-button").first().click();
  const dialog = page.getByRole("dialog");
  await checkModalType(dialog);
  const row = dialog.getByRole("radio").nth(1);
  const title = row.locator(".service-option-span-2");
  const surfaces = () =>
    row.evaluate((element) =>
      [element, element.querySelector(".service-option-span")!].map(
        (e) => getComputedStyle(e).backgroundColor,
      ),
    );
  const original = await surfaces();
  await row.hover();
  await expect(title).toHaveCSS("color", "rgb(44, 52, 132)");
  expect(await surfaces()).toEqual(original);
  await page.mouse.down();
  await expect(title).toHaveCSS("color", "rgb(110, 97, 57)");
  expect(await surfaces()).toEqual(original);
  await page.mouse.up();
  await page.mouse.move(20, 20);
  await expect(row).toBeChecked();
  await expect(title).toHaveCSS("color", "rgb(125, 110, 66)");
  expect(await surfaces()).toEqual(original);
  await expect(row.locator(".service-option-span-3")).toHaveCSS(
    "width",
    "18px",
  );
  await expect(row.locator(".service-option-radio-indicator")).toHaveCSS(
    "width",
    "8px",
  );
  await page.keyboard.press("Tab");
  await row.focus();
  await expect(row).toHaveCSS("outline-width", "2px");
});

test("styled bank select shows logos and supports keyboard selection", async ({
  page,
}) => {
  await open(page, "/");
  const bank = page.getByRole("combobox", { name: "은행 선택" });
  await bank.click();
  const options = page.getByRole("option");
  await expect(options).toHaveCount(10);
  for (const option of await options.all()) {
    await expect(option.locator(".bank-filter-logo")).toBeVisible();
    await expect(option.locator(".bank-filter-logo")).toHaveCSS(
      "width",
      "20px",
    );
  }
  await checkPointers(page);
  await page.getByRole("option", { name: "하나은행", exact: true }).click();
  await expect(bank).toContainText("하나은행");
  await expect(bank.locator("img")).toHaveAttribute("src", "/banks/hana.webp");
  await bank.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(bank).toContainText("신한은행");
  await expect(page.locator(".desktop-list .stub-card")).toHaveCount(2);
  await bank.press("ArrowDown");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(bank).toBeFocused();
  await expect(bank).toContainText("신한은행");
});
