import { createWriteStream } from "fs";
import { exit } from "process";
import * as csv from "fast-csv";
import { readFile } from "fs/promises";
import { generatePSP34TokenItemId, HashOrContent } from "@logion/client";

const TOTAL = 120;
const NONCE = "";
const CONTRACT = "__CONTRACT__";

async function main() {
    const metadataFolder = "metadata";
    const imageFolder = "images";

    const csvStream = csv.format({ headers: true });
    const fileStream = createWriteStream("items.csv");
    csvStream.pipe(fileStream);

    for (let i = 0; i < TOTAL; ++i) {
        console.log(`Handling token ${ i }`);
        const metadataFile = `${ metadataFolder }/${ i }.json`;
        const imageFile = `${imageFolder}/${i}.png`;

        const itemId = generatePSP34TokenItemId(NONCE, { type: "U64", value: i.toString() }).toHex();
        const metadataBuffer = await readFile(metadataFile);
        const metadata = JSON.parse(metadataBuffer.toString());
        const image = await HashOrContent.fromContentFinalized(imageFile);
        const fileName = `${i}.png`;

        csvStream.write({
            ["ID"]: itemId,
            ["DESCRIPTION"]: metadata.description,
            ["FILE NAME"]: fileName,
            ["FILE CONTENT TYPE"]: "image/png",
            ["FILE SIZE"]: image.size?.toString(),
            ["FILE HASH"]: image.contentHash?.toHex(),
            ["RESTRICTED"]: "Y",
            ["TOKEN TYPE"]: "astar_psp34",
            ["TOKEN ID"]: `{"contract":"${ CONTRACT }","id":{"U64":${ i }}}`,
            ["TOKEN ISSUANCE"]: 1,
            ["TERMS_AND_CONDITIONS TYPE"]: "logion_classification",
            ["TERMS_AND_CONDITIONS PARAMETERS"]: `{"transferredRights": ["PER-PRIV", "WW", "NOTIME"]}`,
        });
    }

    csvStream.end();
}

main().catch((error) => {
    console.error(error);
    exit(1);
});
