"""
tests/test_navigation.py — Selenium tests for authenticated app navigation.

These tests REQUIRE Firebase credentials set as environment variables:
  TEST_EMAIL=your@email.com
  TEST_PASSWORD=yourpassword

Or create a .env.test file in tests/selenium/:
  TEST_EMAIL=your@email.com
  TEST_PASSWORD=yourpassword

Tests will be SKIPPED automatically if credentials are not provided.

Usage:
  cd tests/selenium
  pytest tests/test_navigation.py -v
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from pages.app_shell import AppShell


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture()
def app(logged_in_driver, base_url) -> AppShell:
    """Return an AppShell POM for the authenticated driver."""
    return AppShell(logged_in_driver, base_url)


# ── Tests: App Shell Structure ────────────────────────────────────────────────

class TestAppShellStructure:

    def test_sidebar_is_visible_after_login(self, app):
        """After successful login, the sidebar navigation should be present."""
        assert app.is_sidebar_visible(), "Sidebar (#sidebar-nav) not found after login"

    def test_topbar_is_visible_after_login(self, app):
        """After successful login, the topbar should be present."""
        assert app.is_topbar_visible(), "Topbar (#topbar) not found after login"

    def test_login_form_is_gone_after_login(self, app):
        """The login form email field should not be visible in the authenticated state."""
        fields = app.driver.find_elements(By.ID, "login-email")
        assert len(fields) == 0, "Login email field should not be visible when authenticated"


# ── Tests: Sidebar Navigation ─────────────────────────────────────────────────

class TestSidebarNavigation:

    def test_navigate_to_dashboard(self, app):
        """Clicking Dashboard nav item loads the dashboard view."""
        app.go_to_dashboard()
        assert app.wait_for_content("dashboard", timeout=8), \
            "Dashboard content did not load after clicking Dashboard nav"

    def test_navigate_to_workouts(self, app):
        """Clicking Workouts nav item loads the workout library."""
        app.go_to_workouts()
        assert app.wait_for_content("workout", timeout=8), \
            "Workout content did not appear after clicking Workouts nav"

    def test_navigate_to_nutrition(self, app):
        """Clicking Nutrition nav item loads the nutrition tracker."""
        app.go_to_nutrition()
        assert app.wait_for_content("nutrition", timeout=8), \
            "Nutrition content did not appear after clicking Nutrition nav"

    def test_navigate_to_analytics(self, app):
        """Clicking Analytics nav item loads the analytics view."""
        app.go_to_analytics()
        assert app.wait_for_content("analytic", timeout=8), \
            "Analytics content did not appear after clicking Analytics nav"

    def test_navigate_to_ai_coach(self, app):
        """Clicking AI Coach nav item loads the AI coach view."""
        app.go_to_ai_coach()
        assert app.wait_for_content("coach", timeout=8), \
            "AI Coach content did not appear after clicking AI Coach nav"

    def test_navigate_to_settings(self, app):
        """Clicking Settings nav item loads the settings view."""
        app.go_to_settings()
        assert app.wait_for_content("setting", timeout=8), \
            "Settings content did not appear after clicking Settings nav"

    def test_navigate_back_to_dashboard(self, app):
        """Should be able to navigate away and return to the dashboard."""
        app.go_to_workouts()
        app.wait_for_content("workout", timeout=8)
        app.go_to_dashboard()
        assert app.wait_for_content("dashboard", timeout=8), \
            "Could not navigate back to Dashboard"

    def test_all_nav_items_present(self, app):
        """All expected sidebar nav items should be rendered."""
        driver = app.driver
        nav_tabs = ["dashboard", "workouts", "log", "nutrition", "analytics", "ai-coach", "settings"]
        missing = []
        for tab in nav_tabs:
            elements = driver.find_elements(By.CSS_SELECTOR, f"[data-tab='{tab}']")
            if len(elements) == 0:
                missing.append(tab)
        assert not missing, f"Missing sidebar nav items: {missing}"
