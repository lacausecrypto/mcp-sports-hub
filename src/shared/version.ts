/**
 * Single source of truth for the package version. Read from package.json so
 * we never have to bump the version in multiple files.
 */

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json") as { version: string; name: string };

export const VERSION: string = pkg.version;
export const PACKAGE_NAME: string = pkg.name;
export const USER_AGENT = `${PACKAGE_NAME}/${VERSION}`;
