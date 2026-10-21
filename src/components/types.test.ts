import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";
import { expect, it } from "vitest";

// Type-checks every component directory against `AcceptingClassName`, which
// a type test would do for a list of directories written by hand. Finding
// them here means a new directory is checked without anyone adding it.

const componentsDir = path.dirname(fileURLToPath(import.meta.url));

const directories = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

// A module that exists only in memory, beside the directories so that their
// paths resolve. Each directory gets a line of its own, so a diagnostic's
// line says which directory it is about.
const checkFile = path.join(componentsDir, "accepting-class-name.check.ts");
const header = [
  'import type { AcceptingClassName } from "./types.testing";',
  "type ExpectNever<T extends never> = T;",
];
const checkSource = [
  ...header,
  ...directories.map(
    (directory, index) =>
      `export type Check${String(index)} = ExpectNever<AcceptingClassName<typeof import("./${directory}")>>;`,
  ),
].join("\n");

function diagnosticsByLine() {
  const config = ts.getParsedCommandLineOfConfigFile(
    path.resolve(componentsDir, "../../tsconfig.json"),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
  );
  if (config === undefined) throw new Error("tsconfig.json was not read");

  const host = ts.createCompilerHost(config.options);
  const getSourceFile = host.getSourceFile.bind(host);
  const fileExists = host.fileExists.bind(host);
  host.getSourceFile = (fileName, languageVersion, ...rest) =>
    path.resolve(fileName) === checkFile
      ? ts.createSourceFile(fileName, checkSource, languageVersion)
      : getSourceFile(fileName, languageVersion, ...rest);
  host.fileExists = (fileName) =>
    path.resolve(fileName) === checkFile || fileExists(fileName);

  const program = ts.createProgram([checkFile], config.options, host);
  const source = program.getSourceFile(checkFile);
  const byLine = new Map<number, string[]>();

  for (const diagnostic of ts.getPreEmitDiagnostics(program, source)) {
    const line =
      diagnostic.file && diagnostic.start !== undefined
        ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line
        : -1;
    const message = ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      "\n",
    );
    byLine.set(line, [...(byLine.get(line) ?? []), message]);
  }

  return byLine;
}

const diagnostics = diagnosticsByLine();

it("type-checks the generated module itself", () => {
  const ownLines = [-1, ...header.keys()];
  expect(ownLines.flatMap((line) => diagnostics.get(line) ?? [])).toEqual([]);
});

// Each directory's `index.ts` is what the rest of the app imports, so a
// directory without one fails here too.
it.each(directories.map((directory, index) => [directory, index] as const))(
  "finds no component in %s that accepts className",
  (_, index) => {
    expect(diagnostics.get(header.length + index) ?? []).toEqual([]);
  },
);
