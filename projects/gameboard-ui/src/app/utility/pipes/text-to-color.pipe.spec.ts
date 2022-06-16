import { TextToColorPipe } from './text-to-color.pipe';

describe('TextToColorPipe', () => {
  it('create an instance', () => {
    const pipe = new TextToColorPipe();
    expect(pipe).toBeTruthy();
  });
});
