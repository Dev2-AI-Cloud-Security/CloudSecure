import { test, expect } from '@playwright/test';

test.describe('CloudSecure Application Tests', () => {
  test('homepage has title', async ({ page }) => {
    await page.goto('http://localhost:3030/login');
    await expect(page.getByText('CloudSecure')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Email \/ Username$/ }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Password$/ }).first()).toBeVisible();
    await expect(page.locator('iframe[title="Sign in with Google Button"]').contentFrame().getByRole('button', { name: 'Sign in with Google' })).toBeVisible();

    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
  });
  
  test('login functionality, invalid user', async ({ page }) => {
    await page.goto('http://localhost:3030/login');

    // Fill in the login form
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('InvalidUser');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('123456');

    page.on('dialog', dialog => dialog.accept());

    // Click the Login button
    await page.getByRole('button', { name: 'Login' }).click();  

    // Verify that the login failed (e.g., check for an error message)

    await expect(page.getByText('Login failed. Please check your credentials.')).toBeVisible();
    await page.getByRole('button').click();
  });

  test('register functionality', async ({ page }) => {
    await page.goto('http://localhost:3030/login');
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('sampleuser');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('123456');
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await expect(page.getByText('Registration successful. You can now login.')).toBeVisible();
    await page.pause();
    await page.getByRole('button').click();

  });

  // test('login functionality', async ({ page }) => {
  //   await page.goto('http://localhost:3030/login');

  //   // Fill in login form
  //   await page.fill('input[name="email"]', 'testuser@example.com');
  //   await page.fill('input[name="password"]', 'password123');

  //   // Submit the form
  //   await page.click('button[type="submit"]');

  //   // Expect to be redirected to the dashboard
  //   await expect(page).toHaveURL('http://localhost:3030/dashboard');
  //   await expect(page.getByText('Welcome, Test User')).toBeVisible();
  // });

  // test('AWS credentials check', async ({ page }) => {
  //   await page.goto('http://localhost:3030/dashboard');

  //   // Navigate to User Management
  //   await page.click('a[href="/user-management"]');

  //   // Check if AWS credentials are displayed
  //   const awsAccessKeyId = await page.locator('input[name="awsAccessKeyId"]');
  //   const awsSecretAccessKey = await page.locator('input[name="awsSecretAccessKey"]');

  //   await expect(awsAccessKeyId).toBeVisible();
  //   await expect(awsSecretAccessKey).toBeVisible();

  //   // Optionally, verify placeholder or value
  //   await expect(awsAccessKeyId).toHaveAttribute('placeholder', 'Enter AWS Access Key ID');
  //   await expect(awsSecretAccessKey).toHaveAttribute('placeholder', 'Enter AWS Secret Access Key');
  // });

  // test('add EC2 instance', async ({ page }) => {
  //   await page.goto('http://localhost:3030/terraform');

  //   // Fill in EC2 instance details
  //   await page.fill('input[name="instanceName"]', 'TestInstance');
  //   await page.fill('input[name="ami"]', 'ami-12345678');
  //   await page.selectOption('select[name="region"]', 'us-east-1');
  //   await page.selectOption('select[name="instanceType"]', 't2.micro');

  //   // Submit the form
  //   await page.click('button[type="submit"]');

  //   // Expect the new instance to appear in the list
  //   await expect(page.getByText('TestInstance')).toBeVisible();
  // });

  // test('delete all EC2 instances', async ({ page }) => {
  //   await page.goto('http://localhost:3030/terraform');

  //   // Click the delete button
  //   await page.click('button', { hasText: 'Delete All Instances' });

  //   // Confirm the deletion
  //   await page.click('button', { hasText: 'Confirm' });

  //   // Expect no instances to be listed
  //   await expect(page.getByText('No EC2 instances found.')).toBeVisible();
  // });
});
