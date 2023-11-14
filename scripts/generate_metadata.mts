import { generatePSP34TokenItemId } from "@logion/client";
import { mkdir, writeFile, readFile } from "fs/promises";
import { exit } from "process";

const TOTAL = 120;
const NONCE = "";
const COLLECTION_LOC_ID = "292963348700842670123029363923391348386";
const CERTIFICATE_HOST = "certificate.logion.network";

type Attribute = {
    trait_type: string;
    value: string;
}

async function main() {
    const inMetadataFolder = "metadata-input";
    const outMetadataFolder = "metadata";

    await mkdir(outMetadataFolder, { recursive: true });

    for (let i = 0; i < TOTAL; ++i) {
        const inMetadataFile = `${ inMetadataFolder }/${ i.toString() }.json`;
        const metadataBuffer = await readFile(inMetadataFile);
        const metadata = JSON.parse(metadataBuffer.toString());

        const attributes: Attribute [] = [];

        attributes.push({
            trait_type: "LOC ID",
            value: COLLECTION_LOC_ID,
        });
        attributes.push({
            trait_type: "Item ID",
            value: generatePSP34TokenItemId(NONCE, { type: "U64", value: i.toString() }).toHex(),
        });
        attributes.push({
            trait_type: "Certificate URL",
            value: certificateUrl(i),
        });
        metadata.external_url = certificateUrl(i);
        metadata.image = `https://raw.githubusercontent.com/logion-network/logion-paris-dot-comm/main/thumbnails/thumbnail_${ i.toString() }.png`

        delete metadata.image_integrity;

        for (let trait in metadata.attributes.traits) {
            attributes.push({
                trait_type: trait,
                value: metadata.attributes.traits[trait]
            })
        }

        metadata.attributes = attributes;

        let outMetadataFile = `${ outMetadataFolder }/${ i }.json`;
        console.log(`Creating file ${ outMetadataFile }`);
        await writeFile(
            outMetadataFile,
            JSON.stringify(metadata, undefined, 2)
        );
    }
}

function certificateUrl(tokenId: number): string {
    return `https://${ CERTIFICATE_HOST }/public/certificate/${ COLLECTION_LOC_ID }/${ generatePSP34TokenItemId(NONCE, {
        type: "U64",
        value: tokenId.toString()
    }).toHex() }`;
}

main().catch((error) => {
    console.error(error);
    exit(1);
});
