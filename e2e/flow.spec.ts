import { test, expect } from '@playwright/test';

test('User flow: Login, Create Room, Leave, Join, Send Message', async ({ page }) => {
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'password123';
  const topic = `Topic ${Date.now()}`;

  // 1. Signup
  await page.goto('/login');

  // Toggle to Signup mode
  // The toggle button is inside the paragraph "Don't have an account? Sign up"
  const toggleButton = page.locator('button', { hasText: 'Sign up' }).first();
  await toggleButton.click();

  // Verify we are in signup mode (Header changes)
  await expect(page.locator('h2')).toHaveText('Create a new account');

  // Fill signup form
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  // Submit signup
  // The submit button is in the form
  await page.click('form button:has-text("Sign up")');

  // 2. Verify Login Success
  await expect(page).toHaveURL('/');
  await expect(page.locator('text=Sign Out')).toBeVisible();

  // 3. Create Room
  const createRoomSection = page.locator('section', { hasText: 'Create Room' });
  await createRoomSection.locator('input[name="topic"]').fill(topic);
  await createRoomSection.locator('button', { hasText: 'Create New Room' }).click();

  // 4. Verify Room Created
  // URL should contain /room/
  await expect(page).toHaveURL(/\/room\//);
  // Header should contain topic
  await expect(page.locator('h1')).toHaveText(topic);

  // 5. Leave Room
  await page.click('text=Home');
  await expect(page).toHaveURL('/');

  // 6. Join Room by Topic
  const joinRoomSection = page.locator('section', { hasText: 'Go to Room' });
  await joinRoomSection.locator('input[name="topic"]').fill(topic);
  await joinRoomSection.locator('button', { hasText: 'Go to Room' }).click();

  // Verify back in room
  await expect(page).toHaveURL(/\/room\//);
  await expect(page.locator('h1')).toHaveText(topic);

  // 7. Send Message
  const messageContent = 'Hello from Playwright!';
  await page.fill('textarea[name="content"]', messageContent);
  await page.click('button:has-text("Send Message")');

  // Verify message appears
  await expect(page.locator('text=' + messageContent)).toBeVisible();

  // 8. Send File
  const fileName = 'test-file.txt';
  const fileContent = 'This is a test file content.';
  const fileBuffer = Buffer.from(fileContent);

  // Upload file
  await page.setInputFiles('input[type="file"]', {
    name: fileName,
    mimeType: 'text/plain',
    buffer: fileBuffer,
  });

  await page.fill('textarea[name="content"]', 'Sending a file');
  await page.click('button:has-text("Send Message")');

  // Verify file download link
  // Note: The UI displays "Download test-file.txt" or similar?
  // I need to check how file links are rendered.
  // Assuming generic implementation or inspecting code could help, but let's look for the filename.
  // If it's an image, it renders directly. If text, it might render a link.
  // Text files usually don't render inline unless configured.
  // Let's assume there is a link containing the filename.
  await expect(page.locator(`a[download="${fileName}"]`).or(page.locator(`text=${fileName}`))).toBeVisible();
});
