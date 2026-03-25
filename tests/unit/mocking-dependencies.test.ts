import * as fs from 'node:fs/promises';

jest.mock('node:fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

async function callExternalApi(endpoint: string) {
  const response = await fetch(endpoint, { method: 'GET' });
  if (!response.ok) {
    throw new Error('External API call failed');
  }
  return response.json();
}

type EmailClient = {
  send: (input: { to: string; subject: string; body: string }) => Promise<{ id: string }>;
};

async function sendWelcomeEmail(client: EmailClient, email: string) {
  return client.send({
    to: email,
    subject: 'Welcome',
    body: 'Thanks for signing up',
  });
}

async function loadTemplate(path: string) {
  return fs.readFile(path, 'utf8');
}

describe('external dependency mocking', () => {
  it('should mock external API fetch and avoid real network calls', async () => {
    // Arrange
    (global.fetch as unknown as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok' }),
    });

    // Act
    const payload = await callExternalApi('https://service.example.com/health');

    // Assert
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(payload).toEqual({ status: 'ok' });
  });

  it('should mock email service client', async () => {
    // Arrange
    const emailClient: EmailClient = {
      send: jest.fn().mockResolvedValue({ id: 'mail-1' }),
    };

    // Act
    const result = await sendWelcomeEmail(emailClient, 'user@example.com');

    // Assert
    expect(emailClient.send).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Welcome',
      body: 'Thanks for signing up',
    });
    expect(result).toEqual({ id: 'mail-1' });
  });

  it('should mock filesystem read operation', async () => {
    // Arrange
    (fs.readFile as jest.Mock).mockResolvedValueOnce('template-content');

    // Act
    const content = await loadTemplate('/tmp/template.html');

    // Assert
    expect(fs.readFile).toHaveBeenCalledWith('/tmp/template.html', 'utf8');
    expect(content).toBe('template-content');
  });
});
