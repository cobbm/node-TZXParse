# node-TZXParse

A parser/serializer for TZX (ZX Spectrum) tape files written in JavaScript for Node.JS

This parser was reverse engineered via the detailed description of the .tzx format available at: http://k1.spdns.de/Develop/Projects/zasm/Info/TZX%20format.html

# This project is not complete!

The currently supported block types are:

1. `0x10`: Standard speed data block
2. `0x5a`: "Glue" block (90 dec, ASCII Letter 'Z')
   Which is enough to parse .tzx files which contain ZX BASIC programs as saved by the ZX Spectrum using the BASIC `SAVE` command.

## Example

### Parsing a .tzx file

```
const fs = require("fs");
const tzxParse = require("node-tzxparse");

// load your .tzx file:
const tzxFileData = fs.readFileSync("path/to/your/file.tzx");

// parse the blocks in the tzx file:
var tzxBlocks = tzxParse.parseTZX(tzxFileData);

// now do whatever you want with the parsed data:
console.log(tzxBlocks);
```

`parseTZX()` will return an array containing the blocks present inside the .tzx file, for example:

```
[
  { major: 1, minor: 20, length: 9, start: 0, end: 9, blockID: 90 },
  {
    pause: 1000,
    dataLength: 19,
    data: Buffer(19) [Uint8Array] [
        (...)
    ],
    length: 23,
    start: 10,
    end: 33,
    blockID: 16
  },
  {
    pause: 1000,
    dataLength: 60,
    data: Buffer(60) [Uint8Array] [
        (...)
    ],
    length: 64,
    start: 34,
    end: 98,
    blockID: 16
  }
]
```

Each block contains a `blockID` attribute which represents the block type. This can be looked up using `node-tzxparse.BLOCK_IDS`, for example:

```
// block index 0 is typically a "glue" header (type 0x5a (90 decimal)):
var blockID = tzxBlocks[0].blockID; // => 90

// what kind of block is this?
var blockType = tzxParse.BLOCK_IDS[blockID].name;
// should return "\"Glue\" block (90 dec, ASCII Letter 'Z')"
```

## API

### `parseTZX(data, options?)`

parses a .tzx file and returns an array for each block found inside the file

#### - `data`: Type: `Buffer`

The data to parse (.tzx file)

#### - `options`: Type: `Object`

Optional object which may consist of the following options:

-   `skipHeaders`: Type: Boolean, default: false<br />
    Skip all header blocks (type: 0x5a / 90 dec)

## Licence

This software is licenced under [MIT License](https://opensource.org/licenses/MIT).
