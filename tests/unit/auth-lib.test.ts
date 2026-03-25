import {
  extractToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../api/lib/auth';

describe('auth library', () => {
  const payload = { userId: 101, email: 'tester@example.com' };

  it('should generate and verify access token', () => {
    // Arrange
    const token = generateAccessToken(payload);

    // Act
    const decoded = verifyAccessToken(token);

    // Assert
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('should generate and verify refresh token', () => {
    // Arrange
    const token = generateRefreshToken(payload);

    // Act
    const decoded = verifyRefreshToken(token);

    // Assert
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('should throw for invalid access token', () => {
    // Arrange
    const invalidToken = 'invalid-token';

    // Act + Assert
    expect(() => verifyAccessToken(invalidToken)).toThrow('Invalid or expired access token');
  });

  it('should extract token from bearer header', () => {
    // Arrange
    const header = 'Bearer abc.def.ghi';

    // Act
    const token = extractToken(header);

    // Assert
    expect(token).toBe('abc.def.ghi');
  });

  it('should return null when auth header is missing or malformed', () => {
    // Arrange + Act + Assert
    expect(extractToken(undefined)).toBeNull();
    expect(extractToken('Basic xyz')).toBeNull();
  });
});
