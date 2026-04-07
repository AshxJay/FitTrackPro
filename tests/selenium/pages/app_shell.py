"""
pages/app_shell.py — Page Object Model for the FitTrackPro authenticated App Shell.

Covers the Sidebar navigation and Topbar that are present after login.
The sidebar nav items use data-tab attributes set in Sidebar.tsx.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.remote.webdriver import WebDriver


class AppShell:
    # ── Locators ──────────────────────────────────────────────────────────────
    SIDEBAR             = (By.ID, "sidebar-nav")
    TOPBAR              = (By.ID, "topbar")

    # Sidebar nav items — matched by data-tab attribute
    NAV_DASHBOARD       = (By.CSS_SELECTOR, "[data-tab='dashboard']")
    NAV_WORKOUTS        = (By.CSS_SELECTOR, "[data-tab='workouts']")
    NAV_LOG             = (By.CSS_SELECTOR, "[data-tab='log']")
    NAV_NUTRITION       = (By.CSS_SELECTOR, "[data-tab='nutrition']")
    NAV_ANALYTICS       = (By.CSS_SELECTOR, "[data-tab='analytics']")
    NAV_SOCIAL          = (By.CSS_SELECTOR, "[data-tab='social']")
    NAV_AI_COACH        = (By.CSS_SELECTOR, "[data-tab='ai-coach']")
    NAV_SETTINGS        = (By.CSS_SELECTOR, "[data-tab='settings']")

    # Content area headings (to confirm active page)
    CONTENT_AREA        = (By.ID, "main-content")

    def __init__(self, driver: WebDriver, base_url: str):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 10)

    # ── Queries ───────────────────────────────────────────────────────────────

    def is_sidebar_visible(self) -> bool:
        return len(self.driver.find_elements(*self.SIDEBAR)) > 0

    def is_topbar_visible(self) -> bool:
        return len(self.driver.find_elements(*self.TOPBAR)) > 0

    def is_authenticated(self) -> bool:
        """Returns True when the app shell (sidebar) is rendered."""
        return self.is_sidebar_visible()

    def get_page_title(self) -> str:
        return self.driver.title

    # ── Navigation ────────────────────────────────────────────────────────────

    def _click_nav(self, locator: tuple) -> "AppShell":
        self.wait.until(EC.element_to_be_clickable(locator)).click()
        return self

    def go_to_dashboard(self) -> "AppShell":
        return self._click_nav(self.NAV_DASHBOARD)

    def go_to_workouts(self) -> "AppShell":
        return self._click_nav(self.NAV_WORKOUTS)

    def go_to_log(self) -> "AppShell":
        return self._click_nav(self.NAV_LOG)

    def go_to_nutrition(self) -> "AppShell":
        return self._click_nav(self.NAV_NUTRITION)

    def go_to_analytics(self) -> "AppShell":
        return self._click_nav(self.NAV_ANALYTICS)

    def go_to_social(self) -> "AppShell":
        return self._click_nav(self.NAV_SOCIAL)

    def go_to_ai_coach(self) -> "AppShell":
        return self._click_nav(self.NAV_AI_COACH)

    def go_to_settings(self) -> "AppShell":
        return self._click_nav(self.NAV_SETTINGS)

    def wait_for_content(self, text: str, timeout: int = 10) -> bool:
        """Wait until a text string appears anywhere in the page body."""
        try:
            WebDriverWait(self.driver, timeout).until(
                lambda d: text.lower() in d.find_element(By.TAG_NAME, "body").text.lower()
            )
            return True
        except Exception:
            return False
