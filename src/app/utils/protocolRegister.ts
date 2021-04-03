import { protocol, Protocol, CustomScheme, Privileges } from "electron";
import { readFile, readFileSync } from "fs";
import path from "path";
export interface ProtocolRegister {
  privileged: () => CustomScheme;
  register: () => void;
}

/** @remarks Once! */
export default (
  scheme: string,
  privileged?: Privileges,
  customProtocol?: Protocol
): ProtocolRegister => {
  return {
    register: () =>
      (customProtocol ?? protocol).registerBufferProtocol(
        scheme,
        (request, respond) => {
          let pathName = new URL(request.url).pathname;
          pathName = decodeURI(pathName); // Needed in case URL contains spaces
          if (pathName == "/") {
            pathName = "/index.html";
          }
          readFile(path.join(__dirname, pathName), (error, data) => {
            if (error) {
              pathName = "/index.html";
              data = readFileSync(path.join(__dirname, "/index.html"));
            }
            const extension = path.extname(pathName).toLowerCase();
            let mimeType = "";

            if (extension === ".js") {
              mimeType = "text/javascript";
            } else if (extension === ".html") {
              mimeType = "text/html";
            } else if (extension === ".css") {
              mimeType = "text/css";
            } else if (extension === ".svg" || extension === ".svgz") {
              mimeType = "image/svg+xml";
            } else if (extension === ".json") {
              mimeType = "application/json";
            } else if (extension === ".wasm") {
              mimeType = "application/wasm";
            }

            respond({ mimeType, data });
          });
        }
      ),
    privileged: () => ({
      scheme: "app",
      privileges: privileged ?? {
        allowServiceWorkers: true,
        bypassCSP: true,
        corsEnabled: true,
        secure: true,
        standard: true,
        stream: true,
        supportFetchAPI: true,
      },
    }),
  };
};
