"""
conftest.py — pytest fixtures for FitTrackPro Selenium tests.

Environment variables (optional, via .env.test or shell):
  HEADLESS=true        Run Chrome headlessly (great for CI)
  BASE_URL             Override default dev server URL (default: http://localhost:5173)
  TEST_EMAIL           Firebase test account email
  TEST_PASSWORD        Firebase test account password
"""

import os
import pytest
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.edge.options import Options

# Load .env.test if it exists (optional credentials file)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env.test"), override=False)


def _build_driver() -> webdriver.Edge:
    """Construct and return a configured Edge WebDriver instance."""
    options = Options()

    headless = os.getenv("HEADLESS", "false").lower() == "true"
    if headless:
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

    # Window size — consistent layout across machines
    options.add_argument("--window-size=1400,900")

    # Suppress logging noise
    options.add_experimental_option("excludeSwitches", ["enable-logging"])
    options.add_argument("--log-level=3")

    driver = webdriver.Edge(options=options)
    driver.implicitly_wait(8)  # seconds — let React render before failing
    return driver


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def base_url() -> str:
    """Base URL of the running dev server."""
    return os.getenv("BASE_URL", "http://localhost:5173")


@pytest.fixture(scope="session")
def test_credentials() -> dict:
    """Firebase test credentials loaded from env vars."""
    return {
        "email": os.getenv("TEST_EMAIL", ""),
        "password": os.getenv("TEST_PASSWORD", ""),
    }


@pytest.fixture()
def driver():
    """
    Per-test Edge WebDriver fixture.
    Opens a fresh browser for every test and quits after it completes.
    """
    d = _build_driver()
    yield d
    d.quit()


@pytest.fixture()
def logged_in_driver(driver, base_url, test_credentials):
    """
    Pre-authenticated driver fixture.
    Skips the test automatically if TEST_EMAIL / TEST_PASSWORD are not set.
    """
    email = test_credentials["email"]
    password = test_credentials["password"]

    if not email or not password:
        pytest.skip("TEST_EMAIL and TEST_PASSWORD env vars are required for authenticated tests.")

    from pages.login_page import LoginPage  # local import avoids circular refs at module load

    page = LoginPage(driver, base_url)
    page.open()
    page.login(email, password)

    # Wait for the app shell to appear (sidebar is the landmark element)
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.by import By

    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.ID, "sidebar-nav"))
    )
    yield driver
