"""
pages/login_page.py — Page Object Model for the FitTrackPro Login page.

Maps directly to element IDs defined in src/features/auth/LoginPage.tsx:
  #login-email    — email input
  #login-password — password input
  #login-submit   — submit button
  #login-google   — Google OAuth button
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.common.keys import Keys


class LoginPage:
    # ── Locators ──────────────────────────────────────────────────────────────
    EMAIL_INPUT      = (By.ID, "login-email")
    PASSWORD_INPUT   = (By.ID, "login-password")
    SUBMIT_BUTTON    = (By.ID, "login-submit")
    GOOGLE_BUTTON    = (By.ID, "login-google")

    # Structural locators (no IDs, so we use reliable selectors)
    LOGO_TEXT        = (By.XPATH, "//*[contains(text(),'FitTrack')]")
    HEADING_WELCOME  = (By.XPATH, "//h2[contains(text(),'Welcome back')]")
    CREATE_ACCOUNT   = (By.XPATH, "//*[contains(text(),'Create an account')]")
    FORGOT_PASSWORD  = (By.XPATH, "//*[contains(text(),'Forgot password')]")
    ERROR_BANNER     = (By.XPATH, "//*[contains(text(),'Login failed') or contains(text(),'No account') or contains(text(),'Incorrect password') or contains(text(),'Too many attempts') or contains(text(),'auth/')]")

    def __init__(self, driver: WebDriver, base_url: str):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 10)

    # ── Navigation ────────────────────────────────────────────────────────────

    def open(self) -> "LoginPage":
        """Navigate to the app root (which shows the login page when unauthenticated)."""
        self.driver.get(self.base_url)
        self.wait.until(EC.presence_of_element_located(self.EMAIL_INPUT))
        return self

    # ── Actions ───────────────────────────────────────────────────────────────

    def enter_email(self, email: str) -> "LoginPage":
        field = self.wait.until(EC.element_to_be_clickable(self.EMAIL_INPUT))
        field.send_keys(Keys.CONTROL + "a")
        field.send_keys(Keys.BACKSPACE)
        field.send_keys(email)
        return self

    def enter_password(self, password: str) -> "LoginPage":
        field = self.wait.until(EC.element_to_be_clickable(self.PASSWORD_INPUT))
        field.send_keys(Keys.CONTROL + "a")
        field.send_keys(Keys.BACKSPACE)
        field.send_keys(password)
        return self

    def click_sign_in(self) -> "LoginPage":
        self.wait.until(EC.element_to_be_clickable(self.SUBMIT_BUTTON)).click()
        return self

    def click_google_signin(self) -> "LoginPage":
        self.wait.until(EC.element_to_be_clickable(self.GOOGLE_BUTTON)).click()
        return self

    def click_create_account(self) -> "LoginPage":
        self.wait.until(EC.element_to_be_clickable(self.CREATE_ACCOUNT)).click()
        return self

    def click_forgot_password(self) -> "LoginPage":
        self.wait.until(EC.element_to_be_clickable(self.FORGOT_PASSWORD)).click()
        return self

    def login(self, email: str, password: str) -> "LoginPage":
        """Convenience: fill credentials and submit."""
        return self.enter_email(email).enter_password(password).click_sign_in()

    # ── Queries ───────────────────────────────────────────────────────────────

    def get_email_value(self) -> str:
        return self.driver.find_element(*self.EMAIL_INPUT).get_attribute("value")

    def get_password_value(self) -> str:
        return self.driver.find_element(*self.PASSWORD_INPUT).get_attribute("value")

    def get_submit_text(self) -> str:
        return self.driver.find_element(*self.SUBMIT_BUTTON).text

    def get_google_button_text(self) -> str:
        return self.driver.find_element(*self.GOOGLE_BUTTON).text

    def is_submit_disabled(self) -> bool:
        btn = self.driver.find_element(*self.SUBMIT_BUTTON)
        return btn.get_attribute("disabled") is not None

    def is_email_field_present(self) -> bool:
        return len(self.driver.find_elements(*self.EMAIL_INPUT)) > 0

    def is_password_field_present(self) -> bool:
        return len(self.driver.find_elements(*self.PASSWORD_INPUT)) > 0

    def is_google_button_present(self) -> bool:
        return len(self.driver.find_elements(*self.GOOGLE_BUTTON)) > 0

    def is_logo_visible(self) -> bool:
        return len(self.driver.find_elements(*self.LOGO_TEXT)) > 0

    def is_welcome_heading_visible(self) -> bool:
        return len(self.driver.find_elements(*self.HEADING_WELCOME)) > 0

    def wait_for_error(self, timeout: int = 8) -> str:
        """Wait for an auth error banner and return its text."""
        el = WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located(self.ERROR_BANNER)
        )
        return el.text

    def get_page_title(self) -> str:
        return self.driver.title
