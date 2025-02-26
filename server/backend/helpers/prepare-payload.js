import fs from "fs";
import { minify } from "terser";
async function preparePayload(domain) {
    // Prepare the response
    let result = fs.readFileSync("assets/base.js", "utf-8");
    result = result.replace("{{DOMAIN}}", domain);

    // Load html2canvas.min.js
    result = result.replace("{HTML2CANVAS}", fs.readFileSync("assets/html2canvas.min.js", "utf-8"));

    result = await minify(result);
    result = result.code;  

    return result;
}

export {
    preparePayload
}