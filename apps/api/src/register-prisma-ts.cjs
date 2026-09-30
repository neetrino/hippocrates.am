const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");

const original = Module._resolveFilename;

Module._resolveFilename = function resolvePrismaTs(request, parent, isMain, options) {
  const fromGenerated = parent?.filename?.includes(`${path.sep}generated${path.sep}prisma${path.sep}`);
  if (typeof request === "string" && request.endsWith(".js") && fromGenerated) {
    const tsRequest = `${request.slice(0, -3)}.ts`;
    const candidate = path.resolve(path.dirname(parent.filename), tsRequest);
    if (fs.existsSync(candidate)) {
      return original.call(this, tsRequest, parent, isMain, options);
    }
  }
  return original.call(this, request, parent, isMain, options);
};
