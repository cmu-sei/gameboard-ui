import { WhitespacePipe } from './whitespace.pipe';

describe('WhitespacePipe', () => {
  let pipe: WhitespacePipe;

  describe('WhitespacePipe', () => {
    beforeEach(() => {
      pipe = new WhitespacePipe();
    });

    it('create an instance', () => {
      expect(pipe).toBeTruthy();
    });

    it("should not split a string with a url", () => {
      const testValue = "This is some text with a link https://google.com";
      const result = pipe.transform(testValue);

      expect(result).toHaveSize(1);
    });

    it("should split text with one whitespace character into two", () => {
      const testValue = "This\r\n\r\n is a multiline comment See?";
      const result = pipe.transform(testValue);

      expect(result).toHaveSize(2);
    });

    it("should split text with multiple consecutive characters into two", () => {
      const testValue = "This is some text and a\n\r\n\rbig break";
      const result = pipe.transform(testValue);

      expect(result).toHaveSize(2);
    });

    it("should split text with multiple non-consecutive newline characters into 3", () => {
      const testValue = "This is some text and a\n\r\n\rbig break";
      const result = pipe.transform(testValue);

      expect(result).toHaveSize(2);
    });
  });
});
