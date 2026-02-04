const { CreateNote } = require('../src/domain/usecases/CreateNote');

describe('CreateNote use-case', () => {
  test('throws error when researcherId is missing', async () => {
    const noteRepo = { create: jest.fn() };
    const usecase = new CreateNote(noteRepo);

    await expect(usecase.execute({ content: 'hello' })).rejects.toThrow(
      'researcherId is required'
    );
  });

  test('throws error when content is missing', async () => {
    const noteRepo = { create: jest.fn() };
    const usecase = new CreateNote(noteRepo);

    await expect(usecase.execute({ researcherId: 'r1' })).rejects.toThrow(
      'content is required'
    );
  });
  test('calls noteRepo.create(note) with a Note instance-like object', async () => {
    const noteRepo = {
      // ✅ id يجب أن يأتي بعد spread
      create: jest.fn(async (note) => ({ ...note, id: 'n1' })),
    };
    const usecase = new CreateNote(noteRepo);

    const result = await usecase.execute({
      researcherId: 'r1',
      content: 'my note',
    });

    expect(noteRepo.create).toHaveBeenCalledTimes(1);

    const noteArg = noteRepo.create.mock.calls[0][0];

    expect(noteArg.researcherId).toBe('r1');
    expect(noteArg.content).toBe('my note');
    expect(noteArg.createdAt).toBeInstanceOf(Date);
    expect(noteArg.id).toBeUndefined();

    expect(result).toEqual(
      expect.objectContaining({
        id: 'n1',
        researcherId: 'r1',
        content: 'my note',
      })
    );
  });
});
