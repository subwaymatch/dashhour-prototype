import { expect, test, type Page } from "@playwright/test";

async function checkPointers(page: Page) {
  const failures = await page
    .locator(
      'a[href], button, [role="radio"], [role="switch"], [role^="menuitem"], [role="tab"]',
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
  await expect(time).toHaveCSS("font-size", "11px");
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
  await checkPointers(page);
  const radios = dialog.getByRole("radio");
  await radios.nth(1).click();
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

test("mobile cards navigate from the bottom half and layouts fit small screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/");
  const card = page.locator(".stub-card").filter({ visible: true }).first();
  const action = card.locator(".stub-card-action");
  const href = await action.getAttribute("href");
  const box = (await card.boundingBox())!;
  await page.mouse.click(box.x + 28, box.y + box.height - 16);
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
  await expect(filter).toHaveCSS("background-color", "rgb(21, 26, 79)");
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
  await page.goto("/story");
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
