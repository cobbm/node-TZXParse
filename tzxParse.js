const BLOCK_IDS = {
    StandardSpeed: 0x10,
    TurboSpeed: 0x11,
    PureTone: 0x12,
    Pulses: 0x13,
    Pure: 0x14,
    DirectRecording: 0x15,
    CSWRecording: 0x18,
    Generalized: 0x19,
    StopTheTape: 0x20,
    GroupStart: 0x21,
    GroupEnd: 0x22,
    JumpToBlock: 0x23,
    LoopStart: 0x24,
    LoopEnd: 0x25,
    CallSequence: 0x26,
    ReturnFromSequence: 0x27,
    SelectBlock: 0x28,
    StopTheTape48K: 0x2a,
    SetSignalLevel: 0x2b,
    TextDescription: 0x30,
    Message: 0x31,
    ArchiveInfo: 0x32,
    HardwareType: 0x33,
    CustomInfo: 0x35,
    Glue: 0x5a,
    0x10: { key: "StandardSpeed", name: "Standard speed data block" },
    0x11: { key: "TurboSpeed", name: "Turbo speed data block" },
    0x12: { key: "PureTone", name: "Pure tone" },
    0x13: { key: "Pulses", name: "Sequence of pulses of various lengths" },
    0x14: { key: "Pure", name: "Pure data block" },
    0x15: { key: "DirectRecording", name: "Direct recording block" },
    0x18: { key: "CSWRecording", name: "CSW recording block" },
    0x19: { key: "Generalized", name: "Generalized data block" },
    0x20: { key: "StopTheTape", name: "Pause (silence) or 'Stop the tape' command" },
    0x21: { key: "GroupStart", name: "Group start" },
    0x22: { key: "GroupEnd", name: "Group end" },
    0x23: { key: "JumpToBlock", name: "Jump to block" },
    0x24: { key: "LoopStart", name: "Loop start" },
    0x25: { key: "LoopEnd", name: "Loop end" },
    0x26: { key: "CallSequence", name: "Call sequence" },
    0x27: { key: "ReturnFromSequence", name: "Return from sequence" },
    0x28: { key: "SelectBlock", name: "Select block" },
    0x2a: { key: "StopTheTape48K", name: "Stop the tape if in 48K mode" },
    0x2b: { key: "SetSignalLevel", name: "Set signal level" },
    0x30: { key: "TextDescription", name: "Text description" },
    0x31: { key: "Message", name: "Message block" },
    0x32: { key: "ArchiveInfo", name: "Archive info" },
    0x33: { key: "HardwareType", name: "Hardware type" },
    0x35: { key: "CustomInfo", name: "Custom info block" },
    0x5a: { key: "Glue", name: "\"Glue\" block (90 dec, ASCII Letter 'Z')" },
};

function parseTZXHeader(data, offset) {
    const magic = Buffer.from("ZXTape!\u001a");
    if (data.length - offset < 10) {
        return null;
    }
    const hdr = data.subarray(offset, offset + 10);

    if (hdr.indexOf(magic) != 0) {
        return null;
    }
    const major = hdr.readUint8(8);
    const minor = hdr.readUint8(9);
    return {
        major,
        minor,
        length: 9,
    };
}

function parseTZXStandardSpeed(blockData, offset) {
    const pause = blockData.readUint16LE(offset);
    const dataLength = blockData.readUint16LE(offset + 2);
    const data = blockData.subarray(offset + 4, offset + 4 + dataLength);
    return { pause, dataLength, data, length: dataLength + 4 };
}

function parseTZXBlock(data, offset) {
    const blockID = data.readUint8(offset);
    var parsedBlock = null;

    switch (blockID) {
        case BLOCK_IDS.StandardSpeed:
            parsedBlock = parseTZXStandardSpeed(data, offset + 1);
            break;
        case BLOCK_IDS.Glue:
            parsedBlock = parseTZXHeader(data, offset);
            break;
        default:
            //console.log(`Error: Unrecognised block type: 0x${blockID.toString(16)}: ${BLOCK_IDS[blockID].name}`);
            break;
    }
    if (parsedBlock == null) {
        throw new Error(`Unable to parse block type 0x${blockID.toString(16)} at byte position ${offset}`);
        return null;
    }
    parsedBlock.start = offset;
    parsedBlock.end = offset + parsedBlock.length;
    parsedBlock.blockID = blockID;
    return parsedBlock;
}

function parseTZX(data, options = null) {
    var opts = options || {};
    var blocks = [];

    var i = 0;
    while (i < data.length) {
        var block = parseTZXBlock(data, i);
        if (block == null) {
            break;
        }
        if (block.blockID == BLOCK_IDS.Glue) {
            if (!(i == 0 && opts.skipFirstHeader) && !opts.skipHeaders) {
                blocks.push(block);
            }
        } else {
            blocks.push(block);
        }
        i = block.end + 1;
    }
    return blocks;
}

module.exports = {
    BLOCK_IDS,
    parseTZX,
};
