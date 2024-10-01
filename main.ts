// I guess we doing Deno now

import * as fs from "@std/fs";
import * as path from "@std/path";

console.log("Welcome to the Geometry Dash icon hack patcher!");
console.log("Enter the path to the Geometry Dash executable to get started.");

function promptGDExe() {
    const gdExe = prompt(">", path.join(
        Deno.env.get("ProgramFiles(x86)") || "C:/Program Files (x86)",
        "Steam",
        "steamapps",
        "common",
        "Geometry Dash",
        "GeometryDash.exe"
    ));
    if (!gdExe) return promptGDExe();
    else return path.resolve(Deno.cwd(), gdExe.trim());
}

const gdExe = promptGDExe();
if (!fs.existsSync(gdExe) || !Deno.statSync(gdExe).isFile) {
    console.error(`%cInvalid executable path: ${gdExe}`, "color: red");
    Deno.exit(1);
}
else console.log(gdExe);

console.log("Enter the number of the action you want to perform:");
console.log("1. Add the icon hack");
console.log("2. Remove the icon hack");
console.log("3. Exit");

function promptAction() {
    const action = prompt(">")?.trim();
    if (!action || !["1", "2", "3"].includes(action)) return promptAction();
    else return action;
}

const TIMESTAMP_2206 = 1717243515;

const patches = [
    {
        offset: 0x172c26,
        original: [0x05, 0x7c],
        patched: [0x01, 0x7d]
    },
    {
        offset: 0x172c7f,
        original: [0x02, 0x7d],
        patched: [0x01, 0x7c]
    },
    {
        offset: 0x172fc1,
        original: [0x04, 0x7d],
        patched: [0x00, 0x7c]
    }
];

const action = promptAction();
switch (action) {
    case "1":
        console.log("1. Add the icon hack");
        patchGDExe();
        break;
    case "2":
        console.log("2. Remove the icon hack");
        unpatchGDExe();
        break;
    case "3":
        console.log("3. Exit");
        console.log("Exiting...");
        break;
}

function patchGDExe() {
    console.log("%cPatching Geometry Dash executable...", "color: cyan");
    const gdExeBackup = gdExe + ".bak";
    fs.copySync(gdExe, gdExeBackup, { overwrite: true });
    console.log(`%cBackup created at ${gdExeBackup}`, "color: yellow");
    const gdExeBuffer = Deno.readFileSync(gdExe);
    const gdExeView = new DataView(gdExeBuffer.buffer);
    const gdTimestamp = gdExeView.getUint32(gdExeView.getUint32(0x3C, true) + 0x8, true);
    if (gdTimestamp != TIMESTAMP_2206) {
        console.error(
            `%cUnsupported Geometry Dash version detected (Expected ${new Date(TIMESTAMP_2206 * 1000).toISOString()}, got ${new Date(gdTimestamp * 1000).toISOString()})`,
            "color: red"
        );
        return;
    }

    for (const patch of patches) {
        const patched = new Uint8Array(patch.patched);
        gdExeView.setUint8(patch.offset, patched[0]);
        gdExeView.setUint8(patch.offset + 1, patched[1]);
    }

    Deno.writeFileSync(gdExe, gdExeBuffer);
    console.log("%cGeometry Dash executable patched successfully!", "color: green");
}

function unpatchGDExe() {
    console.log("%cUnpatching Geometry Dash executable...", "color: cyan");
    const gdExeBackup = gdExe + ".bak";
    fs.copySync(gdExe, gdExeBackup, { overwrite: true });
    console.log(`%cBackup created at ${gdExeBackup}`, "color: yellow");
    const gdExeBuffer = Deno.readFileSync(gdExe);
    const gdExeView = new DataView(gdExeBuffer.buffer);
    const gdTimestamp = gdExeView.getUint32(gdExeView.getUint32(0x3C, true) + 0x8, true);
    if (gdTimestamp != TIMESTAMP_2206) {
        console.error(
            `%cUnsupported Geometry Dash version detected (Expected ${new Date(TIMESTAMP_2206 * 1000).toISOString()}, got ${new Date(gdTimestamp * 1000).toISOString()})`,
            "color: red"
        );
        return;
    }

    for (const patch of patches) {
        const original = new Uint8Array(patch.original);
        gdExeView.setUint8(patch.offset, original[0]);
        gdExeView.setUint8(patch.offset + 1, original[1]);
    }

    Deno.writeFileSync(gdExe, gdExeBuffer);
    console.log("%cGeometry Dash executable unpatched successfully!", "color: green");
}
