import {
  createDemoJob,
  deleteDemoJob,
  getAllDemoJobs,
  getDemoJob,
  getDemoJobs,
  isDemoMode,
  updateDemoJob,
} from '../../api/lib/demo-data';

describe('demo data utilities', () => {
  it('should detect demo mode when DATABASE_URL is not set', () => {
    // Arrange
    const oldValue = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    // Act
    const demoMode = isDemoMode();

    // Assert
    expect(demoMode).toBe(true);

    process.env.DATABASE_URL = oldValue;
  });

  it('should create and retrieve a demo job', () => {
    // Arrange
    const initialCount = getAllDemoJobs().length;

    // Act
    const created = createDemoJob({
      company: 'Test Company',
      position: 'QA Engineer',
      keywords: ['Jest'],
    });

    // Assert
    expect(getAllDemoJobs()).toHaveLength(initialCount + 1);
    expect(getDemoJob(created.id)?.company).toBe('Test Company');
    expect(getDemoJob(created.id)?.position).toBe('QA Engineer');
  });

  it('should update and delete demo jobs', () => {
    // Arrange
    const created = createDemoJob({
      company: 'Temp Co',
      position: 'Backend Dev',
      archived: false,
    });

    // Act
    const updated = updateDemoJob(created.id, { archived: true, status: 'Archived' });
    const deleted = deleteDemoJob(created.id);

    // Assert
    expect(updated?.archived).toBe(true);
    expect(updated?.status).toBe('Archived');
    expect(deleted).toBe(true);
    expect(getDemoJob(created.id)).toBeUndefined();
    expect(getDemoJobs().every((job) => !job.archived)).toBe(true);
  });
});
