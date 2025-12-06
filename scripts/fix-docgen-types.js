#!/usr/bin/env node

/**
 * Post-process script for docgen output.
 * Replaces links to browser-supplied types with MDN documentation links.
 */

const fs = require('fs');
const path = require('path');

// Map of browser types to their MDN documentation URLs
const mdnLinks = {
  DataView: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView',
  ArrayBuffer: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer',
  Uint8Array: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array',
  Promise: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise',
  Error: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error',
  Map: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map',
  Set: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set',
  Record: 'https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type',
  Int8Array: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Int8Array',
  Uint16Array: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array',
  Int16Array: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Int16Array',
  Uint32Array: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array',
  Int32Array: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Int32Array',
  Float32Array: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Float32Array',
  Float64Array: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Float64Array',
  ArrayLike: 'https://www.typescriptlang.org/docs/handbook/interfaces.html#indexable-types',
  ArrayBufferTypes: '',
};

function replaceTypeLinks(content) {
  let result = content;

  Object.entries(mdnLinks).forEach(([typeName, url]) => {
    // Remove complete type definition sections with headers
    // These sections start with "#### TypeName" and continue until the next "####" or end of content
    const sectionPattern = new RegExp(`^#### ${typeName}\\n[\\s\\S]*?(?=^#### )`, 'gm');
    result = result.replace(sectionPattern, '');

    // Replace each type's self-referencing anchor links with MDN links
    const lowerTypeName = typeName.toLowerCase();

    // Pattern 1: <a href="#typename">TypeName</a>
    // This handles links like <a href="#dataview">DataView</a>
    const anchorPattern = new RegExp(`<a href="#${lowerTypeName}">${typeName}</a>`, 'g');
    result = result.replace(anchorPattern, `[${typeName}](${url})`);
  });

  // Remove the entire Type Aliases section
  // Matches "### Type Aliases" heading through the next "###" or "##" heading
  result = result.replace(/^### Type Aliases\n[\s\S]*?(?=^### |^## )/gm, '');

  // Remove Type Aliases from table of contents
  // Matches lines like "* [Type Aliases](#type-aliases)" with optional leading spaces
  result = result.replace(/^\s*\*\s*\[Type Aliases\]\(#type-aliases\)\n/gm, '');

  // Clean up any resulting multiple consecutive blank lines
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

function main() {
  const readmePath = path.join(__dirname, '..', 'README.md');

  if (!fs.existsSync(readmePath)) {
    console.error(`Error: README.md not found at ${readmePath}`);
    process.exit(1);
  }

  console.log('Reading README.md...');
  let content = fs.readFileSync(readmePath, 'utf8');

  console.log('Replacing browser type links with MDN links...');
  content = replaceTypeLinks(content);

  console.log('Writing updated README.md...');
  fs.writeFileSync(readmePath, content, 'utf8');

  console.log('✓ Successfully updated type links in README.md');
}

main();
