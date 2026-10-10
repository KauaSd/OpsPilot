import * as fs from "fs";
import * as os from "os";
import { join } from "path";
import { PromptLoaderService } from "./prompt-loader.service";

describe("PromptLoaderService", () => {
  afterEach(() => {
    delete process.env.PROMPTS_DIR;
  });

  it("carrega o prompt v1 a partir da raiz do repositório", () => {
    const service = new PromptLoaderService();
    const content = service.load("v1");
    expect(content).toContain("OpsPilot");
    expect(content.length).toBeGreaterThan(100);
  });

  it("cacheia em memória (funciona mesmo se o arquivo sumir depois)", () => {
    const dir = fs.mkdtempSync(join(os.tmpdir(), "opspilot-prompts-"));
    const vdir = join(dir, "triage", "v1");
    fs.mkdirSync(vdir, { recursive: true });
    fs.writeFileSync(join(vdir, "system.md"), "PROMPT CACHEADO OpsPilot");

    process.env.PROMPTS_DIR = dir;
    const service = new PromptLoaderService();
    expect(service.load("v1")).toContain("OpsPilot");

    fs.rmSync(dir, { recursive: true, force: true });
    expect(service.load("v1")).toContain("OpsPilot");
  });

  it("lança erro para versão inexistente", () => {
    const service = new PromptLoaderService();
    expect(() => service.load("v-inexistente")).toThrow();
  });
});
