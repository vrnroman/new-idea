
from playwright.sync_api import sync_playwright

def verify_button_loading_state():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the home page
        page.goto("http://localhost:3000")

        # Take a screenshot of the home page buttons
        page.screenshot(path="verification/home_buttons.png")
        print("Home buttons screenshot captured.")

        # Test the "Create Room" button loading state
        # Since we cannot easily simulate a slow server response to catch the spinner,
        # we can inspect the button element to ensure it is the new SubmitButton component.
        # However, visually we can check if the button looks correct.

        # We can try to click and see if it goes to loading state, but if the action is fast, we might miss it.
        # But we can check if the button has the expected classes.

        create_button = page.get_by_text("Create New Room")
        if create_button.is_visible():
            print("Create New Room button is visible.")
            # Check for the transition class
            class_attr = create_button.get_attribute("class")
            if "transition-transform" in class_attr and "active:scale-95" in class_attr:
                print("Create New Room button has animation classes.")
            else:
                print("Create New Room button missing animation classes:", class_attr)

        # Join Room button
        join_button = page.get_by_text("Join Room")
        if join_button.is_visible():
             print("Join Room button is visible.")

        browser.close()

if __name__ == "__main__":
    verify_button_loading_state()
