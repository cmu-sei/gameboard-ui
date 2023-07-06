import { LinkRendererPipe } from './link-renderer.pipe';

describe('LinkRendererPipe', () => {
    let pipe: LinkRendererPipe;

    beforeEach(() => {
        pipe = new LinkRendererPipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it("should split a string with one link at the end into two tokens", () => {
        const testValue = "This is some text with a link https://google.com";
        const result = pipe.transform(testValue);

        expect(result).toHaveSize(2);
    });

    it("should split a string with one link in the middle of it into three tokens", () => {
        const testValue = "This is some text with a https://google.com link.";
        const result = pipe.transform(testValue);

        expect(result).toHaveSize(3);
    });

    it("should not split a string with no URLs", () => {
        const testValue = "This is some text with a no link but <html><div>has other html</div></html>";
        const result = pipe.transform(testValue);

        expect(result).toHaveSize(1);
        expect(result[0]).toEqual({ isUrl: false, text: testValue });
    });

    it("should split a string with both URLs and html and preserve the html", () => {
        const testValue = "This is some text with a no link but <html><div>has other html</div></html> but this like https://google.com is still here";
        const result = pipe.transform(testValue);

        expect(result).toHaveSize(3);
        expect(result[1]).toEqual({ isUrl: true, text: "https://google.com" });
    });

    it("should preserve white space in the string", () => {
        const testValue = "This is a multiline comment\r\n\r\nSee?";
        const result = pipe.transform(testValue);

        expect(result).toHaveSize(1);
        expect(result[0]).toEqual({ isUrl: false, text: testValue });
    });
});
