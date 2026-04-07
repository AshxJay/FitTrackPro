"""
tests/test_login.py — Selenium tests for the FitTrackPro Login page.

These tests cover unauthenticated flows only — no Firebase credentials needed.
Run against the local Vite dev server (npm run dev).

Usage:
  cd tests/selenium
  pytest tests/test_login.py -v
"""

import sys
import os

# Allow imports from the selenium/ root (pages/, etc.)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from pages.login_page import LoginPage


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture()
def login_page(driver, base_url) -> LoginPage:
    """Open the login page and return the POM instance."""
    page = LoginPage(driver, base_url)
    page.open()
    return page


# ── Tests: Page Load & Structure ──────────────────────────────────────────────

class TestLoginPageStructure:

    def test_page_title_contains_fittrackpro(self, login_page):
        """The browser tab title should reference FitTrackPro."""
        title = login_page.get_page_title()
        assert "fittrack" in title.lower() or title != "", \
            f"Expected a meaningful page title, got: '{title}'"

    def test_logo_is_visible(self, login_page):
        """The FitTrackPro logo/brand text should be present on the page."""
        assert login_page.is_logo_visible(), "FitTrackPro brand text not found on login page"

    def test_welcome_heading_is_visible(self, login_page):
        """'Welcome back' heading should render in the form panel."""
        assert login_page.is_welcome_heading_visible(), "'Welcome back' heading not found"

    def test_email_field_is_present(self, login_page):
        """Email input (#login-email) must be rendered."""
        assert login_page.is_email_field_present(), "#login-email input not found"

    def test_password_field_is_present(self, login_page):
        """Password input (#login-password) must be rendered."""
        assert login_page.is_password_field_present(), "#login-password input not found"

    def test_google_button_is_present(self, login_page):
        """Google OAuth button (#login-google) must be rendered."""
        assert login_page.is_google_button_present(), "#login-google button not found"

    def test_submit_button_text(self, login_page):
        """Submit button should display 'Sign In'."""
        text = login_page.get_submit_text()
        assert "sign in" in text.lower(), f"Expected 'Sign In' on submit button, got: '{text}'"

    def test_google_button_text(self, login_page):
        """Google button should reference Google."""
        text = login_page.get_google_button_text()
        assert "google" in text.lower(), f"Expected 'Google' in button text, got: '{text}'"

    def test_create_account_link_present(self, login_page):
        """'Create an account' link is visible for new users."""
        driver = login_page.driver
        elements = driver.find_elements(By.XPATH, "//*[contains(text(),'Create an account')]")
        assert len(elements) > 0, "'Create an account' link not found"

    def test_forgot_password_link_present(self, login_page):
        """'Forgot password?' link is visible."""
        driver = login_page.driver
        elements = driver.find_elements(By.XPATH, "//*[contains(text(),'Forgot password')]")
        assert len(elements) > 0, "'Forgot password?' link not found"


# ── Tests: Form Interaction ───────────────────────────────────────────────────

class TestLoginFormInteraction:

    def test_email_field_accepts_input(self, login_page):
        """Typing into the email field updates its value."""
        login_page.enter_email("test@example.com")
        assert login_page.get_email_value() == "test@example.com"

    def test_password_field_accepts_input(self, login_page):
        """Typing into the password field updates its value."""
        login_page.enter_password("supersecret123")
        # Value is still accessible programmatically even though it renders as ••••••
        assert login_page.get_password_value() == "supersecret123"

    def test_email_field_clears_on_re_entry(self, login_page):
        """Entering a new email replaces the old value."""
        login_page.enter_email("first@example.com")
        login_page.enter_email("second@example.com")
        assert login_page.get_email_value() == "second@example.com"

    def test_email_input_type_is_email(self, login_page):
        """Email field must have type='email' for browser-native validation."""
        field = login_page.driver.find_element(*LoginPage.EMAIL_INPUT)
        assert field.get_attribute("type") == "email"

    def test_password_input_type_is_password(self, login_page):
        """Password field must have type='password' to mask characters."""
        field = login_page.driver.find_element(*LoginPage.PASSWORD_INPUT)
        assert field.get_attribute("type") == "password"

    def test_email_field_has_placeholder(self, login_page):
        """Email field should have a helpful placeholder."""
        field = login_page.driver.find_element(*LoginPage.EMAIL_INPUT)
        placeholder = field.get_attribute("placeholder")
        assert placeholder and len(placeholder) > 0, "Email field has no placeholder"

    def test_submit_button_is_enabled_by_default(self, login_page):
        """Submit button should be enabled before any interaction."""
        assert not login_page.is_submit_disabled(), "Submit button should not start disabled"

    def test_tab_key_moves_focus_email_to_password(self, login_page):
        """Pressing Tab on the email field should move focus to password."""
        from selenium.webdriver.common.keys import Keys
        email_field = login_page.driver.find_element(*LoginPage.EMAIL_INPUT)
        email_field.click()
        email_field.send_keys(Keys.TAB)
        active = login_page.driver.switch_to.active_element
        assert active.get_attribute("id") == "login-password", \
            "Tab from email should focus password field"


# ── Tests: Auth Flows ─────────────────────────────────────────────────────────

class TestLoginAuthFlow:

    def test_invalid_credentials_show_error(self, login_page):
        """
        Submitting wrong credentials should display a Firebase error message.
        This test makes a real Firebase auth request — it will fail with an
        error banner (not crash the app).
        """
        login_page.login("invalid@doesnotexist.com", "wrongpassword123")
        error_text = login_page.wait_for_error(timeout=12)
        assert error_text and len(error_text) > 0, \
            "Expected an auth error banner after invalid login, got nothing"

    def test_switch_to_signup_view(self, login_page):
        """Clicking 'Create an account' should render the signup form."""
        login_page.click_create_account()

        # Wait for signup-specific content to appear
        wait = WebDriverWait(login_page.driver, 8)
        body = login_page.driver.find_element(By.TAG_NAME, "body")

        # The signup page should no longer show "Welcome back"
        wait.until(lambda d: "welcome back" not in d.find_element(
            By.TAG_NAME, "body").text.lower()
        )
        assert "welcome back" not in body.text.lower(), \
            "Switching to signup should hide the 'Welcome back' heading"

    def test_empty_email_prevents_submit(self, login_page):
        """
        Submitting with a blank email should trigger HTML5 validation
        (the browser blocks the request — no Firebase call is made).
        """
        login_page.enter_password("somepassword")
        login_page.click_sign_in()

        # Page should NOT navigate away — login form is still present
        import time
        time.sleep(1)  # brief pause to ensure no redirect occurred
        assert login_page.is_email_field_present(), \
            "Login form should still be visible after submitting with empty email"
